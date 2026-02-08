package com.example.stockLog.community.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ResetPasswordDto {
    private String email;
    private String newPassword;
}
