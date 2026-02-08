package com.example.stockLog.tradelog.repository;

import com.example.stockLog.tradelog.entity.StockMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

public interface StockMasterRepository extends JpaRepository<StockMaster,String> {
    List<StockMaster> findByStockNameContaining(String keyword, Pageable pageable);
    // 만약 너무 많이 나올까 봐 걱정된다면 Top 10만 가져오는 버전
    List<StockMaster> findTop10ByStockNameContaining(String stockName);
    //top10에서 이미 limit10 붙임. 이미 10개만 가져오게 됨. 굳이 pageable 할 필요 없음
    Optional<StockMaster> findByStockName(String stockName);

}
