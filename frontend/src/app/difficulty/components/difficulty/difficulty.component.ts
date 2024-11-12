import { Component, OnInit } from '@angular/core';
import { Difficulty, DifficultyService } from '../../../core/api';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-difficulty',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './difficulty.component.html',
  styleUrl: './difficulty.component.css',
})
export class DifficultyComponent implements OnInit {
  public difficulties$: Observable<Difficulty[]> = new Observable<
    Difficulty[]
  >();

  constructor(private difficultyService: DifficultyService) {}

  ngOnInit(): void {
    this.difficulties$ = this.difficultyService.difficultyList();
  }
}
