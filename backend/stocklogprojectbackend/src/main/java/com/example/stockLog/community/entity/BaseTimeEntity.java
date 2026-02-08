package com.example.stockLog.community.entity;

import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@MappedSuperclass // 1. 중요! 이 클래스를 상속받는 엔티티들이 아래 필드들을 컬럼으로 인식하게 함
@EntityListeners(AuditingEntityListener.class) // 2. 중요! 자동으로 시간을 입력해주는 기능 활성화
public abstract class BaseTimeEntity {
    @CreatedDate // 생성 시 시간 자동 저장
    private LocalDateTime createdAt;

    @LastModifiedDate // 수정 시 시간 자동 저장
    private LocalDateTime updatedAt;
}
