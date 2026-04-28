import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { queryClient } from '@/lib/queryClient';
import {
  invalidateAll,
  RESERVATION_RELATED,
  MEMBERSHIP_RELATED,
  ATTENDANCE_RELATED,
} from '@/lib/invalidate';

describe('invalidate.ts — RESERVATION_RELATED 그룹', () => {
  let invalidateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
  });

  afterEach(() => {
    invalidateSpy.mockRestore();
  });

  it('reservations 와 complexDashboard 두 키를 모두 포함한다', () => {
    expect(RESERVATION_RELATED).toContain('reservations');
    expect(RESERVATION_RELATED).toContain('complexDashboard');
  });

  it('회귀 가드: complexDashboard 가 빠지면 대시보드 캐시가 stale 된 채 유지되므로 반드시 포함되어야 한다', () => {
    expect(RESERVATION_RELATED).toContain('complexDashboard');
  });

  it('invalidateAll(RESERVATION_RELATED) 호출 시 각 키에 대해 invalidateQueries 가 호출된다', () => {
    invalidateAll(RESERVATION_RELATED);

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['reservations'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['complexDashboard'] });
    expect(invalidateSpy).toHaveBeenCalledTimes(RESERVATION_RELATED.length);
  });

  it('invalidateAll(빈배열) 은 invalidateQueries 를 호출하지 않는다', () => {
    invalidateAll([]);
    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it('기존 그룹들도 complexDashboard 를 포함하는 컨벤션을 유지한다', () => {
    // MEMBERSHIP_RELATED 와 ATTENDANCE_RELATED 가 이미 complexDashboard 를 포함하는 패턴.
    // RESERVATION_RELATED 도 같은 컨벤션을 따랐다는 사실을 명시적으로 잠근다.
    expect(MEMBERSHIP_RELATED).toContain('complexDashboard');
    expect(ATTENDANCE_RELATED).toContain('complexDashboard');
  });
});
