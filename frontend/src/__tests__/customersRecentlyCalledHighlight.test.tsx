import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Customer } from '@/lib/api';

// ── mocks ──

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/customers',
}));

// DateTimePicker 는 react-datepicker 의존이 복잡해 단순 input 으로 대체
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

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return {
    ...actual,
    customerApi: {
      ...actual.customerApi,
      list: (...args: unknown[]) => mockList(...args),
    },
  };
});

// ── helpers ──

function makeCustomer(seq: number, name: string, overrides: Partial<Customer> = {}): Customer {
  return {
    seq,
    name,
    phoneNumber: `0101234${String(seq).padStart(4, '0')}`,
    callCount: 0,
    status: '신규',
    createdDate: '2026-04-20T10:00:00',
    ...overrides,
  };
}

function renderPage(ui: React.ReactElement) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

const HIGHLIGHT_BG = 'rgb(243, 232, 255)'; // #f3e8ff

async function findRow(name: string): Promise<HTMLTableRowElement> {
  const cell = await screen.findByText(name);
  const row = cell.closest('tr');
  if (!row) throw new Error(`row not found for ${name}`);
  return row as HTMLTableRowElement;
}

let CustomersPage: React.ComponentType;

beforeEach(async () => {
  vi.clearAllMocks();
  const mod = await import('@/app/(main)/customers/page');
  CustomersPage = mod.default;
});

// ── tests ──

describe('CustomersPage 최근 caller 선택 행 강조', () => {
  it('recentlyCalled=true 인 행은 강조 배경색을 갖는다', async () => {
    mockList.mockResolvedValue({
      success: true,
      data: {
        content: [makeCustomer(1, '최근통화', { recentlyCalled: true })],
        totalPages: 1, totalElements: 1, number: 0, size: 20,
      },
    });

    renderPage(<CustomersPage />);
    const row = await findRow('최근통화');
    expect(row.style.backgroundColor).toBe(HIGHLIGHT_BG);
  });

  it('recentlyCalled=false 인 행은 강조 배경색이 없다', async () => {
    mockList.mockResolvedValue({
      success: true,
      data: {
        content: [makeCustomer(2, '오래된통화', { recentlyCalled: false })],
        totalPages: 1, totalElements: 1, number: 0, size: 20,
      },
    });

    renderPage(<CustomersPage />);
    const row = await findRow('오래된통화');
    expect(row.style.backgroundColor).toBe('');
  });

  it('recentlyCalled 가 undefined 이면 강조하지 않는다', async () => {
    mockList.mockResolvedValue({
      success: true,
      data: {
        content: [makeCustomer(3, '플래그없음')], // recentlyCalled 미설정
        totalPages: 1, totalElements: 1, number: 0, size: 20,
      },
    });

    renderPage(<CustomersPage />);
    const row = await findRow('플래그없음');
    expect(row.style.backgroundColor).toBe('');
  });

  it('lastUpdateDate 만 있고 recentlyCalled=false 면 강조하지 않는다 (회귀 가드)', async () => {
    // 과거 동작은 lastUpdateDate 존재만으로 강조했으나, caller 선택과 무관한
    // 이름/코멘트 변경 등에서도 강조되는 문제가 있어 서버 플래그로 이전했다.
    mockList.mockResolvedValue({
      success: true,
      data: {
        content: [makeCustomer(4, '코멘트만수정', {
          lastUpdateDate: '2026-04-20T09:00:00',
          recentlyCalled: false,
        })],
        totalPages: 1, totalElements: 1, number: 0, size: 20,
      },
    });

    renderPage(<CustomersPage />);
    const row = await findRow('코멘트만수정');
    expect(row.style.backgroundColor).toBe('');
  });

  it('여러 고객이 섞여 있을 때 recentlyCalled=true 인 행만 강조된다', async () => {
    mockList.mockResolvedValue({
      success: true,
      data: {
        content: [
          makeCustomer(10, '강조O', { recentlyCalled: true }),
          makeCustomer(11, '강조X', { recentlyCalled: false }),
        ],
        totalPages: 1, totalElements: 2, number: 0, size: 20,
      },
    });

    renderPage(<CustomersPage />);
    const rowOn = await findRow('강조O');
    const rowOff = await findRow('강조X');
    expect(rowOn.style.backgroundColor).toBe(HIGHLIGHT_BG);
    expect(rowOff.style.backgroundColor).toBe('');
  });
});
