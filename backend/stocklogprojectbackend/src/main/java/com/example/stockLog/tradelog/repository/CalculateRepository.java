package com.example.stockLog.tradelog.repository;

import com.example.stockLog.tradelog.entity.Calculate;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CalculateRepository extends JpaRepository<Calculate, Long> {
    //배당금 계산기 나중에 만듦..
}
