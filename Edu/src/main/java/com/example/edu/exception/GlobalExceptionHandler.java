package com.example.edu.exception;

import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler({SQLException.class, DataAccessException.class})
    public ResponseEntity<Map<String, String>> handleDatabaseExceptions(Exception ex) {
        // Log the actual exception for internal debugging (optional)
        // ex.printStackTrace();

        Map<String, String> response = new HashMap<>();
        response.put("error", "Database Error");
        response.put("message", "Đã xảy ra lỗi khi truy xuất dữ liệu. Vui lòng thử lại sau.");

        // Return 500 Internal Server Error without leaking SQL details
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        // Log the actual exception for internal debugging (optional)
        // ex.printStackTrace();

        Map<String, String> response = new HashMap<>();
        response.put("error", "Internal Server Error");
        response.put("message", "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.");

        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
