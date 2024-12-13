import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SummaryRetrieve200Response, SummaryService } from '../core/api';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [TableModule, DecimalPipe],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.css',
})
export class SummaryComponent implements OnInit {
  public year: number = new Date().getFullYear();
  public data: SummaryRetrieve200Response | undefined;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly summarySerivce: SummaryService,
    private readonly messageService: MessageService,
  ) {}

  public updateYearData(year: number): void {
    this.summarySerivce.summaryRetrieve(year).subscribe({
      next: (data) => {
        console.log(data);
        this.data = data;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to retrieve summary for year ${this.year}.`,
        });
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
  }
}
