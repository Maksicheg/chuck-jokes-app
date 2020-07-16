import { Joke } from './../../shared/interfaces/joke.interface';
import { JokeTypeEnum } from './../../shared/enums/joke-type.enum';
import { JokeCategoryEnum } from '../../shared/enums/joke-category.enum';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { JokesService } from 'src/app/shared/services/jokes.service';
import { Subject, throwError } from 'rxjs';
import { takeUntil, delay } from 'rxjs/operators';
import { JokesMapperService } from 'src/app/shared/services/jokes-mapper.service';
import { JokeApi } from 'src/app/shared/interfaces/jokeApi.interface';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-joke-form',
  templateUrl: './joke-form.component.html',
  styleUrls: ['./joke-form.component.scss'],
})
export class JokeFormComponent implements OnInit, OnDestroy {
  public jokeForm: FormGroup;
  public categories: string[] = [];
  public jokeTypeEnum = JokeTypeEnum;
  public jokeTypeState: string;
  private unsubscribe = new Subject<void>();

  private formSubmitResolver = {
    [JokeTypeEnum.random]: () => this.getRandomOrByCategoryJoke(JokeTypeEnum.random, null),
    [JokeTypeEnum.top]: () => this.getTopJokes(JokeTypeEnum.top),
    [JokeTypeEnum.categories]: () => this.getRandomOrByCategoryJoke(JokeTypeEnum.categories, this.controls.category.value),
    [JokeTypeEnum.search]: () => this.searchJokes(this.controls.search.value),
  };

  constructor(
    private jokesService: JokesService,
    private jokesMapperService: JokesMapperService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getCategories();
    this.subscribeToFormTypeValueChanges();
  }

  // getter for easy access to form controls
  get controls() { return this.jokeForm.controls; }

  private initForm(): void {
    this.jokeForm = this.formBuilder.group({
      type: [JokeTypeEnum.random],
      top: [JokeTypeEnum.top],
      category: [JokeCategoryEnum.animal],
      search: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  private getCategories(): void {
    this.jokesService
      .getCategories()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((categoriesData: string[]) => {
        this.categories = [...categoriesData];
      });
  }

  private subscribeToFormTypeValueChanges(): void {
    this.controls.type.valueChanges
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(type => {
        this.jokeTypeState = type;
        if (type !== JokeTypeEnum.search) {
          this.controls.search.reset();
        }
      });
  }

  private getTopJokes(type: JokeTypeEnum): void {
    this.jokesService.changeLoadingState(true);
    this.jokesService.getTopJokes(type)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (jokes: Joke[]) => {
          this.jokesService.changeJokes(jokes);
          this.jokesService.changeLoadingState(false);
        },
        error => {
          this.jokesService.changeError(error);
          this.jokesService.changeLoadingState(false);
        });
  }

  private getRandomOrByCategoryJoke(type: JokeTypeEnum, categoryValue: JokeCategoryEnum): void {
    this.jokesService.changeLoadingState(true);
    this.jokesService.getJoke(type, categoryValue)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (joke: Joke[]) => {
          this.jokesService.changeJokes(joke);
          this.jokesService.changeLoadingState(false);
        },
        error => {
          this.jokesService.changeError(error);
          this.jokesService.changeLoadingState(false);
        });
  }

  private searchJokes(searchValue: string): void {
    this.jokesService.changeLoadingState(true);
    this.jokesService
      .searchJokes(searchValue)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (jokes: Joke[]) => {
          this.jokesService.changeJokes(jokes);
          this.jokesService.changeLoadingState(false);
        },
        error => {
          this.jokesService.changeError(error);
          this.jokesService.changeLoadingState(false);
        });
  }

  public submitForm(): void {
    this.jokesService.changeError('');
    this.formSubmitResolver[this.controls.type.value]();
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
