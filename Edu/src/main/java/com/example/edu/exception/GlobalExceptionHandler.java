package com.example.edu.exception;

import com.example.edu.dto.response.ErrorResponse;
import java.time.LocalDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.MethodArgumentNotValidException;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
                Map<String, String> errors = new HashMap<>();
                ex.getBindingResult().getFieldErrors()
                                .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
        }

        @ExceptionHandler(BadCredentialsException.class)
        public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(ErrorResponse.builder()
                                                .message(ex.getMessage())
                                                .status(HttpStatus.UNAUTHORIZED.value())
                                                .timestamp(LocalDateTime.now())
                                                .build());
        }

        @ExceptionHandler(LockedException.class)
        public ResponseEntity<ErrorResponse> handleLockedException(LockedException ex) {
                return ResponseEntity.status(HttpStatus.LOCKED)
                                .body(ErrorResponse.builder()
                                                .message(ex.getMessage())
                                                .status(HttpStatus.LOCKED.value())
                                                .timestamp(LocalDateTime.now())
                                                .build());
        }

        @ExceptionHandler(DisabledException.class)
        public ResponseEntity<ErrorResponse> handleDisabledException(DisabledException ex) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(ErrorResponse.builder()
                                                .message(ex.getMessage())
                                                .status(HttpStatus.FORBIDDEN.value())
                                                .timestamp(LocalDateTime.now())
                                                .build());
        }

        @ExceptionHandler({
                        org.springframework.dao.DataAccessException.class,
                        java.sql.SQLException.class,
                        jakarta.persistence.PersistenceException.class
        })
        public ResponseEntity<ErrorResponse> handleDatabaseExceptions(Exception ex) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(ErrorResponse.builder()
                                                .message("Đã xảy ra lỗi hệ thống khi truy xuất dữ liệu. Vui lòng thử lại sau.")
                                                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                                                .timestamp(LocalDateTime.now())
                                                .build());
        }

        @ExceptionHandler(RuntimeException.class)
        public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(ErrorResponse.builder()
                                                .message(ex.getMessage())
                                                .status(HttpStatus.BAD_REQUEST.value())
                                                .timestamp(LocalDateTime.now())
                                                .build());
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorResponse> handleGeneralException(Exception ex) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(ErrorResponse.builder()
                                                .message("Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.")
                                                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                                                .timestamp(LocalDateTime.now())
                                                .build());
        }
}
