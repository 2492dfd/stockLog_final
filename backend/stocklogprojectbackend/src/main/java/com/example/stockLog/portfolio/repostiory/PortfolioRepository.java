package com.example.stockLog.portfolio.repostiory;

import com.example.stockLog.portfolio.entity.PortfolioEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PortfolioRepository extends JpaRepository<PortfolioEntity, Long> {
    List<PortfolioEntity> findByUserId(Long id);

}
