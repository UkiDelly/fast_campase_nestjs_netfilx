import { PartialType } from '@nestjs/mapped-types'
import {
  registerDecorator,
  ValidatorConstraint,
  type ValidationArguments,
  type ValidationOptions,
  type ValidatorConstraintInterface,
} from 'class-validator'
import { CreateMovieDto } from './create-movie.dto'

// 커스텀 Validator
@ValidatorConstraint({ async: false }) // 비동기로 처리할지 여부
class PasswordValidator implements ValidatorConstraintInterface {
  validate(value: any, validationArguments?: ValidationArguments): Promise<boolean> | boolean {
    /// 비밀번호 길이는 4-8

    return (value as string).length > 4 && (value as string).length < 8
  }
  defaultMessage?(validationArguments?: ValidationArguments): string {
    return '비밀번호는 4-8자여야 합니다. 입력된 값: $value' // $value는 입력된 값
  }
}

// 커스텀 데코레이터를 IsPasswordValid로 정의
function IsPasswordValid(validationOptions?: ValidationOptions) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: PasswordValidator,
    })
  }
}

export class UpdateMovieDto extends PartialType(CreateMovieDto) {
  // @IsDefined() // null이거나 undefined일 수 없음
  // @IsOptional() // null이거나 undefined일 수 있음
  // @Equals('test') // 값이 'test'여야 함
  // @IsEmpty() // null 또는 undefined 또는 ''
  // @IsNotEmpty() // null 또는 undefined 또는 ''이 아니어야 함
  // 배열
  // @IsIn(['test1', 'test2']) // 값이 'test1' 또는 'test2'여야 함
  // @IsNotIn(['test1', 'test2']) // 값이 'test1' 또는 'test2'가 아니어야 함
  // @IsArray() // 배열이어야 함
  // @IsDateString()  // IOS 8601 date string이여야함
  // @IsDivisibleBy(5) // 5로 나누어 떨어져야 함
  // @IsPositive() // 양수여야 함
  // @IsNegative() // 음수여야 함
  // @Min(10) // 최소값
  // @Max(20) // 최대값
  // String 관련
  // @Contains('test') // 값이 'test'를 포함해야 함
  // @NotContains('test') // 값이 'test'를 포함하지 않아야 함
  // @IsAlphanumeric() // 문자열이 알파벳 또는 숫자여야 함
  // @IsCreditCard() // 존재할수 있는 신용카드여야 함 (0000-0000-0000-0000)
  // @IsHexColor() // 16진수 색상 코드여야 함
  // @MaxLength(10) // 최대 길이
  // @MinLength(5) // 최소 길이
  // @IsUUID() // UUID여야 함
  // @IsLatLong() // 위도, 경도여야 함
  // @Validate(PasswordValidator) // 커스텀 Validator를 추가 처리 없이 그냥 사용
  // @IsPasswordValid() // 커스텀 Validator를 데코레이터로 만들어서 사용
  // test: string;
}
