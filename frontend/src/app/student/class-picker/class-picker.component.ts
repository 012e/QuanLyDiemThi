import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import {
  DialogService,
  DynamicDialogComponent,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { TableModule, TablePageEvent } from 'primeng/table';
import { Subject as RxSubject, debounceTime, distinctUntilChanged } from 'rxjs';
import { Class, ClassService } from '../../core/api';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-class-picker',
  standalone: true,
  imports: [TableModule, ButtonModule, InputTextModule],
  providers: [MessageService],
  templateUrl: './class-picker.component.html',
  styleUrl: './class-picker.component.css',
})
export class ClassPickerComponent implements OnInit {
  public instance: DynamicDialogComponent | undefined;
  public exceptClasses!: Array<number>;

  constructor(
    public dialogRef: DynamicDialogRef,
    private readonly dialogService: DialogService,
    private readonly classService: ClassService,
    private readonly messageService: MessageService
  ) {
    this.instance = this.dialogService.getInstance(this.dialogRef);
  }

  private readonly DEFAULT_PAGE_SIZE = 10;

  classes!: Class[];
  class!: Class;

  submitted: boolean = false;
  searchValue: string | undefined;

  public count!: number;
  public first: number = 0;
  public rows: number = this.DEFAULT_PAGE_SIZE;
  public searchText: string = '';

  private searchText$ = new RxSubject<string>();

  public ngOnInit(): void {
    this.loadInitialData();
    this.initParams();
  }

  public initParams(): void {
    if (!this.instance) {
      throw new Error('Instance is not defined');
    }
    const data = this.instance.data;
    if (!data) {
      throw new Error('Data is not defined');
    }
    // TODO: implements exceptions
    this.exceptClasses = data.questionExceptions;
  }

  public resetPage() {
    this.first = 0;
  }

  private loadInitialData() {
    this.searchText$
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((query: string) => {
        this.resetPage();
        this.searchText = query;
        this.updatePage();
      });

    this.updatePage();
  }

  public onPage(event: TablePageEvent): void {
    this.first = event.first;
    this.rows = event.rows;
    this.updatePage();
  }

  public updatePage(): void {
    this.classService
      .classList(this.rows, this.first, undefined) //this.searchText
      .subscribe((data) => {
        this.classes = data.results;
        this.count = data.count;
      });
  }

  public showError(error: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: error,
      life: 3000,
    });
  }

  public showSuccess(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Successful',
      detail: message,
      life: 3000,
    });
  }

  public getValue(event: Event) {
    return (event.target as HTMLInputElement).value;
  }

  public handleSearch(query: string) {
    this.searchText$.next(query);
  }

  public select(classroom: Class): void {
    console.log(`Selected classroom ${classroom.id}`);
    this.dialogRef.close(classroom);
  }
}
