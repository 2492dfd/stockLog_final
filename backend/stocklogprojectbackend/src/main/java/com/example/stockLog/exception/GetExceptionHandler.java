package com.example.stockLog.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GetExceptionHandler {
    @ExceptionHandler(IllegalArgumentException.class)
       public ResponseEntity<Map<String, String>> handleIllegalArgumentException
            (IllegalArgumentException e) {
               Map<String, String> errorResponse = new HashMap<>();
                 errorResponse.put("message", e.getMessage());
                 return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
             }

                @ExceptionHandler(IllegalStateException.class)
       public ResponseEntity<Map<String, String>> handleIllegalStateException
            (IllegalStateException e) {
                 Map<String, String> errorResponse = new HashMap<>();
                 errorResponse.put("message", e.getMessage());
                 // '중복'과 같은 상태 충돌은 409 Conflict 상태 코드가 더 적절합니다.
                 return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
                      }
}
