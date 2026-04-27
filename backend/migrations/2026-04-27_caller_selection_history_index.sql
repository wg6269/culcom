-- =============================================================================
-- Migration: 2026-04-27
--   caller_selection_history 에 (customer_id, selected_date) 복합 인덱스 추가
--
--   목적: 고객 리스트 조회 시 "최근 5시간 내 caller 선택 여부" 를
--         EXISTS 서브쿼리로 행마다 판정한다 (CustomerQueryMapper.search).
--         인덱스가 없으면 결과 행 수만큼 caller_selection_history 를
--         풀스캔하게 된다. 한 고객당 통화 이력이 누적되는 구조라
--         시간이 갈수록 지연이 가속화된다.
--
--   설계 메모
--     - 단일 customer_id 인덱스가 아닌 복합 인덱스인 이유:
--       서브쿼리 조건이 customer_id = ? AND selected_date >= ? 이므로
--       두 컬럼을 모두 인덱스 안에서 처리해 EXISTS 가 즉시 종료된다.
--     - 같은 패턴: member_activity_log.idx_mal_member_date
--
-- 대상 DBMS : MySQL (stg / prod)
-- 로컬 H2 (ddl-auto: create) 에는 자동 반영되므로 별도 실행 불필요
-- =============================================================================

CREATE INDEX idx_csh_customer_selected
    ON caller_selection_history (customer_id, selected_date);

-- ─────────────────────────────────────────────────────────────────────────────
-- ROLLBACK
--   DROP INDEX idx_csh_customer_selected ON caller_selection_history;
-- ─────────────────────────────────────────────────────────────────────────────
