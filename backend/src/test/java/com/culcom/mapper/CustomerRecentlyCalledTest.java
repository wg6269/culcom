package com.culcom.mapper;

import com.culcom.dto.customer.CustomerResponse;
import com.culcom.entity.branch.Branch;
import com.culcom.entity.customer.Customer;
import com.culcom.entity.enums.CustomerStatus;
import com.culcom.entity.reservation.CallerSelectionHistory;
import com.culcom.repository.BranchRepository;
import com.culcom.repository.CallerSelectionHistoryRepository;
import com.culcom.repository.CustomerRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * CustomerQueryMapper.search 의 recentlyCalled 플래그 검증.
 *
 * 비즈니스 규칙: caller_selection_history 에 컷오프 시점 이후의 행이 존재하면 true.
 * CallerSelectionHistory 의 selectedDate 는 @PrePersist 로 now() 강제 세팅되므로
 * "5시간 전" 같은 과거 데이터는 native UPDATE 로 백데이트해서 만든다.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CustomerRecentlyCalledTest {

    @Autowired CustomerRepository customerRepository;
    @Autowired BranchRepository branchRepository;
    @Autowired CallerSelectionHistoryRepository callerSelectionHistoryRepository;
    @Autowired CustomerQueryMapper customerQueryMapper;

    @PersistenceContext EntityManager em;

    private Branch branch;

    @BeforeEach
    void setUp() {
        branch = branchRepository.save(Branch.builder()
                .branchName("recently-called-test")
                .alias("recent-called-" + System.nanoTime())
                .build());
    }

    private Customer createCustomer(String name) {
        return customerRepository.save(Customer.builder()
                .name(name)
                .phoneNumber("01012345678")
                .branch(branch)
                .callCount(0)
                .status(CustomerStatus.신규)
                .build());
    }

    private CallerSelectionHistory insertHistory(Customer customer) {
        return callerSelectionHistoryRepository.save(CallerSelectionHistory.builder()
                .customer(customer)
                .branch(branch)
                .caller("A")
                .build());
    }

    /** @PrePersist 가 selectedDate 를 now() 로 덮으므로, insert 후 native UPDATE 로 백데이트. */
    private void backdateHistory(Long historySeq, LocalDateTime newSelectedDate) {
        em.createNativeQuery("UPDATE caller_selection_history SET selected_date = :d WHERE seq = :seq")
                .setParameter("d", newSelectedDate)
                .setParameter("seq", historySeq)
                .executeUpdate();
        em.flush();
        em.clear();
    }

    private List<CustomerResponse> search(LocalDateTime cutoff) {
        em.flush();
        return customerQueryMapper.search(branch.getSeq(), "all", null, null, 0, 100, cutoff);
    }

    @Test
    void caller_선택_이력이_없으면_recentlyCalled_는_false() {
        Customer c = createCustomer("이력없음");

        CustomerResponse row = search(LocalDateTime.now().minusHours(5)).stream()
                .filter(r -> r.getSeq().equals(c.getSeq()))
                .findFirst().orElseThrow();

        assertThat(row.getRecentlyCalled()).isFalse();
    }

    @Test
    void 컷오프_이후_caller_선택_이력이_있으면_recentlyCalled_는_true() {
        Customer c = createCustomer("최근선택");
        insertHistory(c); // selectedDate = now() (컷오프 이후)

        CustomerResponse row = search(LocalDateTime.now().minusHours(5)).stream()
                .filter(r -> r.getSeq().equals(c.getSeq()))
                .findFirst().orElseThrow();

        assertThat(row.getRecentlyCalled()).isTrue();
    }

    @Test
    void 컷오프_이전_caller_선택_이력만_있으면_recentlyCalled_는_false() {
        Customer c = createCustomer("오래된선택");
        CallerSelectionHistory h = insertHistory(c);
        backdateHistory(h.getSeq(), LocalDateTime.now().minusHours(6));

        CustomerResponse row = search(LocalDateTime.now().minusHours(5)).stream()
                .filter(r -> r.getSeq().equals(c.getSeq()))
                .findFirst().orElseThrow();

        assertThat(row.getRecentlyCalled()).isFalse();
    }

    @Test
    void 오래된_이력과_최근_이력이_섞여있으면_recentlyCalled_는_true() {
        // 최근 5시간 안에 한 건이라도 있으면 true 여야 한다
        Customer c = createCustomer("혼합이력");
        CallerSelectionHistory old = insertHistory(c);
        backdateHistory(old.getSeq(), LocalDateTime.now().minusHours(10));
        insertHistory(c); // 두 번째: now()

        CustomerResponse row = search(LocalDateTime.now().minusHours(5)).stream()
                .filter(r -> r.getSeq().equals(c.getSeq()))
                .findFirst().orElseThrow();

        assertThat(row.getRecentlyCalled()).isTrue();
    }

    @Test
    void 다른_고객의_이력은_영향을_주지_않는다() {
        Customer a = createCustomer("A고객");
        Customer b = createCustomer("B고객");
        insertHistory(a); // a 만 최근 통화

        List<CustomerResponse> rows = search(LocalDateTime.now().minusHours(5));
        CustomerResponse rowA = rows.stream().filter(r -> r.getSeq().equals(a.getSeq())).findFirst().orElseThrow();
        CustomerResponse rowB = rows.stream().filter(r -> r.getSeq().equals(b.getSeq())).findFirst().orElseThrow();

        assertThat(rowA.getRecentlyCalled()).isTrue();
        assertThat(rowB.getRecentlyCalled()).isFalse();
    }
}
