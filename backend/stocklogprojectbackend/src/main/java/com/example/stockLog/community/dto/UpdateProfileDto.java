package com.example.stockLog.community.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UpdateProfileDto {
    private String imageUrl;
    private String nickname;
    private String bio;
}
