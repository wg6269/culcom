import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { Reservation } from '@/app/(main)/calendar/utils';

// ── mocks ──

const mockUpdateStatus = vi.fn();
const mockUpdateDate = vi.fn();
const mockListTemplates = vi.fn();

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return {
    ...actual,
    calendarApi: {
      ...actual.calendarApi,
      updateReservationStatus: (...args: unknown[]) => mockUpdateStatus(...args),
      updateReservationDate: (...args: unknown[]) => mockUpdateDate(...args),
    },
    surveyApi: {
      ...actual.surveyApi,
      listTemplates: (...args: unknown[]) => mockListTemplates(...args),
    },
  };
});

// ── helpers ──

const reservation: Reservation = {
  seq: 42,
  date: '2026-04-27',
  time: '14:00',
  name: '홍길동',
  phone: '01012345678',
  caller: 'A',
  status: '예약',
};

let ReservationStatusModal: React.ComponentType<{
  reservation: Reservation;
  onClose: () => void;
  onStatusChanged: () => void;
}>;

let onClose: ReturnType<typeof vi.fn>;
let onStatusChanged: ReturnType<typeof vi.fn>;

beforeEach(async () => {
  vi.clearAllMocks();
  onClose = vi.fn();
  onStatusChanged = vi.fn();
  mockListTemplates.mockResolvedValue({ success: true, data: [] });
  const mod = await import('@/app/(main)/calendar/components/ReservationStatusModal');
  ReservationStatusModal = mod.default;
});

function renderModal() {
  return render(
    <ReservationStatusModal
      reservation={reservation}
      onClose={onClose}
      onStatusChanged={onStatusChanged}
    />,
  );
}

// ── tests ──

describe('ReservationStatusModal — onStatusChanged 호출 (캐시 무효화 트리거)', () => {
  it('취소 성공 시 onStatusChanged 가 1회 호출된다', async () => {
    mockUpdateStatus.mockResolvedValue({ success: true, data: null });

    renderModal();
    fireEvent.click(screen.getByRole('button', { name: /^취소/ }));

    await waitFor(() => expect(mockUpdateStatus).toHaveBeenCalledWith(reservation.seq, '취소'));
    await waitFor(() => expect(onStatusChanged).toHaveBeenCalledTimes(1));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('연기 성공 시 onStatusChanged 가 1회 호출된다', async () => {
    mockUpdateStatus.mockResolvedValue({ success: true, data: null });

    renderModal();
    fireEvent.click(screen.getByRole('button', { name: /^연기/ }));

    await waitFor(() => expect(mockUpdateStatus).toHaveBeenCalledWith(reservation.seq, '연기'));
    await waitFor(() => expect(onStatusChanged).toHaveBeenCalledTimes(1));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('방문 성공 시 (설문 단계로 진행하더라도) onStatusChanged 가 호출된다', async () => {
    // 방문 분기는 status 업데이트 후 설문 단계로 이동 — 모달은 닫히지 않지만
    // 상태가 변경됐으므로 캐시 무효화는 트리거되어야 한다.
    mockUpdateStatus.mockResolvedValue({ success: true, data: null });

    renderModal();
    fireEvent.click(screen.getByRole('button', { name: /^방문/ }));

    await waitFor(() => expect(mockUpdateStatus).toHaveBeenCalledWith(reservation.seq, '방문'));
    await waitFor(() => expect(onStatusChanged).toHaveBeenCalledTimes(1));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('날짜 변경 성공 시 onStatusChanged 가 호출된다', async () => {
    mockUpdateDate.mockResolvedValue({ success: true, data: null });

    renderModal();
    // 1) "날짜 변경" 버튼으로 date 단계 전환
    fireEvent.click(screen.getByRole('button', { name: /^날짜 변경/ }));
    // 2) 날짜/시간 입력
    fireEvent.change(await screen.findByLabelText('날짜'), { target: { value: '2026-05-01' } });
    fireEvent.change(screen.getByLabelText('시간'), { target: { value: '15:30' } });
    // 3) "저장" 클릭
    fireEvent.click(screen.getByRole('button', { name: /^저장/ }));

    await waitFor(() =>
      expect(mockUpdateDate).toHaveBeenCalledWith(reservation.seq, '2026-05-01T15:30:00'),
    );
    await waitFor(() => expect(onStatusChanged).toHaveBeenCalledTimes(1));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('취소 실패 시 onStatusChanged 가 호출되지 않는다 (success 분기 가드)', async () => {
    mockUpdateStatus.mockResolvedValue({ success: false, message: '서버 오류', data: null });

    renderModal();
    fireEvent.click(screen.getByRole('button', { name: /^취소/ }));

    await waitFor(() => expect(mockUpdateStatus).toHaveBeenCalled());
    expect(onStatusChanged).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('날짜 변경 실패 시 onStatusChanged 가 호출되지 않는다', async () => {
    mockUpdateDate.mockResolvedValue({ success: false, message: '시간 충돌', data: null });

    renderModal();
    fireEvent.click(screen.getByRole('button', { name: /^날짜 변경/ }));
    fireEvent.change(await screen.findByLabelText('날짜'), { target: { value: '2026-05-01' } });
    fireEvent.change(screen.getByLabelText('시간'), { target: { value: '15:30' } });
    fireEvent.click(screen.getByRole('button', { name: /^저장/ }));

    await waitFor(() => expect(mockUpdateDate).toHaveBeenCalled());
    expect(onStatusChanged).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
