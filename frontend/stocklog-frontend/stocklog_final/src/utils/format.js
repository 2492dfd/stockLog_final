// src/utils/format.js

/**
 * 값이 null 또는 undefined일 경우 대체 문자(-)를 반환하고,
 * 그렇지 않으면 값을 포맷하여 단위(unit)와 함께 반환하는 공통 함수
 * @param {number | string | null | undefined} value - 표시할 값
 * @param {string} unit - 값 뒤에 붙일 단위 (예: "원", "%")
 * @param {number} fixed - 소수점 자릿수 (toFixed)
 * @returns {string} 포맷된 문자열 또는 대체 문자
 */
export const formatDisplay = (value, unit = "", fixed = null) => {
    if (value === null || value === undefined) {
        return "-";
    }

    let numberValue = Number(value);
    if (isNaN(numberValue)) {
        return "-";
    }
    
    if (fixed !== null) {
        numberValue = numberValue.toFixed(fixed);
    }
    
    return `${numberValue.toLocaleString()}${unit}`;
};
