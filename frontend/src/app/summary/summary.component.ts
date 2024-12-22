import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SummaryRetrieve200Response, SummaryService } from '../core/api';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { DecimalPipe } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumber, InputNumberInputEvent, InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [TableModule, DecimalPipe, InputNumberModule, FormsModule],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.css',
})
export class SummaryComponent implements OnInit {
  public year: number = new Date().getFullYear();
  public data: SummaryRetrieve200Response | undefined;
  public year$: Subject<number> = new Subject<number>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly summarySerivce: SummaryService,
    private readonly messageService: MessageService,
    private readonly router: Router,
  ) {}

  public updateYearData(year: number): void {
    this.summarySerivce.summaryRetrieve(year).subscribe({
      next: (data) => {
        console.log(data);
        this.data = data;
        this.messageService.add({
          severity: 'info',
          summary: 'Info',
          detail: `Updated summary for year ${this.year}.`,
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to retrieve summary for year ${this.year}.`,
        });
        this.router.navigate(['summary', new Date().getFullYear()])
      },
    });
  }

  public ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const param = params.get('year');
      if (param && +param) {
        this.year = parseInt(param, 10);
      } else {
        this.year = new Date().getFullYear();
      }
      
      this.updateYearData(this.year);
    });

    this.year$
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((year) => {
        this.router.navigate(['/summary', year]);
      });
  }

  public updateYear(event: InputNumberInputEvent): void {
    if (!event.value) {
      return;
    }
    this.year$.next(+event.value);
  }
}
