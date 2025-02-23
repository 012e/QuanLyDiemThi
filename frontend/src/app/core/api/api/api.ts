export * from './api.service';
import { ApiService } from './api.service';
export * from './api.serviceInterface';
export * from './auth.service';
import { AuthService } from './auth.service';
export * from './auth.serviceInterface';
export * from './class.service';
import { ClassService } from './class.service';
export * from './class.serviceInterface';
export * from './config.service';
import { ConfigService } from './config.service';
export * from './config.serviceInterface';
export * from './difficulty.service';
import { DifficultyService } from './difficulty.service';
export * from './difficulty.serviceInterface';
export * from './permission.service';
import { PermissionService } from './permission.service';
export * from './permission.serviceInterface';
export * from './question.service';
import { QuestionService } from './question.service';
export * from './question.serviceInterface';
export * from './result.service';
import { ResultService } from './result.service';
export * from './result.serviceInterface';
export * from './role.service';
import { RoleService } from './role.service';
export * from './role.serviceInterface';
export * from './student.service';
import { StudentService } from './student.service';
export * from './student.serviceInterface';
export * from './studentresult.service';
import { StudentresultService } from './studentresult.service';
export * from './studentresult.serviceInterface';
export * from './subject.service';
import { SubjectService } from './subject.service';
export * from './subject.serviceInterface';
export * from './summary.service';
import { SummaryService } from './summary.service';
export * from './summary.serviceInterface';
export * from './test.service';
import { TestService } from './test.service';
export * from './test.serviceInterface';
export * from './user.service';
import { UserService } from './user.service';
export * from './user.serviceInterface';
export const APIS = [ApiService, AuthService, ClassService, ConfigService, DifficultyService, PermissionService, QuestionService, ResultService, RoleService, StudentService, StudentresultService, SubjectService, SummaryService, TestService, UserService];
