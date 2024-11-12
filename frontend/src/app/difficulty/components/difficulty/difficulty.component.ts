import { Component, OnInit } from "@angular/core";
import { DifficultyService, PaginatedDifficultyList } from "../../../core/api";
import { Observable, of } from "rxjs";
import { AsyncPipe } from "@angular/common";
import { TableModule } from "primeng/table";
import { CommonModule } from "@angular/common";
import { ButtonModule } from "primeng/button";

@Component({
	selector: "app-difficulty",
	standalone: true,
	imports: [AsyncPipe, TableModule, CommonModule, ButtonModule],
	templateUrl: "./difficulty.component.html",
	styleUrl: "./difficulty.component.css",
})
export class DifficultyComponent implements OnInit {
	public difficulties$: Observable<PaginatedDifficultyList> = of();
	public count: number = 0;
	public first: number = 0;

	constructor(private difficultyService: DifficultyService) {}

	ngOnInit(): void {
		this.difficulties$ = this.difficultyService
			.difficultyList()
			.subscribe((value) => {});
	}
}
