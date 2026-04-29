import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Customer } from '@/lib/api';

// ── mocks ──

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/customers',
}));

vi.mock('@/components/ui/DateTimePicker', () => ({
  default: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <input
      data-testid="dtp-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

const mockList = vi.fn();
const mockProcessCall = vi.fn();
const mockCreateReservation = vi.fn();
const mockMarkNoPhoneInterview = vi.fn();

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return {
    ...actual,
    customerApi: {
      ...actual.customerApi,
      list: (...args: unknown[]) => mockList(...args),
      processCall: (...args: unknown[]) => mockProcessCall(...args),
      createReservation: (...args: unknown[]) => mockCreateReservation(...args),
      markNoPhoneInterview: (...args: unknown[]) => mockMarkNoPhoneInterview(...args),
    },
  };
});

// ── helpers ──

const customer: Customer = {
  seq: 1,
  name: '홍길동',
  phoneNumber: '01012345678',
  callCount: 0,
  status: '신규',
  createdDate: '2026-04-20T10:00:00',
};

function renderPage(ui: React.ReactElement) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

let CustomersPage: React.ComponentType;

beforeEach(async () => {
  vi.clearAllMocks();
  mockList.mockResolvedValue({
    success: true,
    data: { content: [customer], totalPages: 1, totalElements: 1, number: 0, size: 20 },
  });
  const mod = await import('@/app/(main)/customers/page');
  CustomersPage = mod.default;
});

// ── tests ──

describe('CustomersPage CALLER 미선택 가드', () => {
  it('인터뷰 일시만 입력하고 CALLER 미선택 상태에서 "확정"을 누르면 CALLER 선택 안내 모달이 뜬다', async () => {
    renderPage(<CustomersPage />);

    // 일시는 입력하되 CALLER는 선택하지 않는다
    const dtp = await screen.findByTestId('dtp-input');
    fireEvent.change(dtp, { target: { value: '2026-04-20T10:00' } });

    const inlineConfirm = await screen.findByRole('button', { name: '확정' });
    fireEvent.click(inlineConfirm);

    expect(await screen.findByText('먼저 CALLER를 선택해주세요.')).toBeInTheDocument();
    expect(screen.getByText('실패')).toBeInTheDocument();
    // 가드가 막혀 예약 API는 호출되지 않아야 한다
    expect(mockCreateReservation).not.toHaveBeenCalled();
  });

  it('CALLER 미선택 + 일시 미입력으로 "확정"을 누르면 일시 입력 안내 모달이 우선 뜬다', async () => {
    renderPage(<CustomersPage />);

    // 두 가지 모두 비어있는 상태에서 확정 → 일시 가드가 먼저 걸린다
    await screen.findByRole('button', { name: '확정' });
    const inlineConfirm = screen.getByRole('button', { name: '확정' });
    fireEvent.click(inlineConfirm);

    expect(await screen.findByText('인터뷰 일시를 입력해주세요.')).toBeInTheDocument();
    expect(screen.getByText('실패')).toBeInTheDocument();
    expect(mockCreateReservation).not.toHaveBeenCalled();
  });

  it('CALLER 미선택 상태에서 "전화상안함"을 누르면 CALLER 선택 안내 모달이 뜬다', async () => {
    renderPage(<CustomersPage />);

    const noPhoneBtn = await screen.findByRole('button', { name: '전화상안함' });
    fireEvent.click(noPhoneBtn);

    expect(await screen.findByText('먼저 CALLER를 선택해주세요.')).toBeInTheDocument();
    expect(screen.getByText('실패')).toBeInTheDocument();
    // 전화상안함 확인 모달은 열리지 않아야 한다
    expect(screen.queryByText('전화상 안함 확인')).not.toBeInTheDocument();
    expect(mockMarkNoPhoneInterview).not.toHaveBeenCalled();
  });

  it('결과 모달의 "확인"을 누르면 모달이 닫힌다', async () => {
    renderPage(<CustomersPage />);

    const noPhoneBtn = await screen.findByRole('button', { name: '전화상안함' });
    fireEvent.click(noPhoneBtn);

    const errorMsg = await screen.findByText('먼저 CALLER를 선택해주세요.');
    expect(errorMsg).toBeInTheDocument();

    // ResultModal 의 확인 버튼 클릭
    const confirmBtn = screen.getByRole('button', { name: '확인' });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.queryByText('먼저 CALLER를 선택해주세요.')).not.toBeInTheDocument();
    });
  });

  it('CALLER를 먼저 선택하면 "전화상안함" 가드를 통과해 확인 모달이 열린다', async () => {
    mockProcessCall.mockResolvedValue({
      success: true,
      data: { callCount: 1, lastUpdateDate: '2026-04-20T10:00:00' },
    });

    renderPage(<CustomersPage />);

    // CALLER 'A' 선택 → 확인 모달 → 확인
    const callerA = (await screen.findAllByRole('button', { name: 'A' }))[0];
    fireEvent.click(callerA);
    const callerConfirmBtn = await screen.findByRole('button', { name: '확인' });
    fireEvent.click(callerConfirmBtn);
    await waitFor(() => expect(mockProcessCall).toHaveBeenCalled());

    // 이제 전화상안함을 누르면 가드 통과 → 확인 모달이 열린다
    const noPhoneBtn = screen.getByRole('button', { name: '전화상안함' });
    fireEvent.click(noPhoneBtn);

    expect(await screen.findByText('전화상 안함 확인')).toBeInTheDocument();
    expect(screen.queryByText('먼저 CALLER를 선택해주세요.')).not.toBeInTheDocument();
  });
});
