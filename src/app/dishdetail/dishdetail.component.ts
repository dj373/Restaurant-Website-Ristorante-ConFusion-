import { Component, OnInit, Inject } from '@angular/core';


import { Location } from '@angular/common';
import { Params, ActivatedRoute } from '@angular/router';



import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Comment } from '../shared/comment';

import { switchMap } from 'rxjs/operators';


@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {
  dish: Dish;

  dishIds: number[];
  prev: number;
  next: number;

  feedbackForm: FormGroup;
  comment: Comment;
  errMess: string;

  formErrors = {
    'author': '',
    'comment': ''
  }

  validationMessages = {
    'author': {
      'required': 'Name is required.',
      'minlength': 'Name must be at least 2 characters long.',
      'maxlength': 'Name cannot be more than 32 characters long.'
    },
    'comment': {
      'required': 'Comment is required.',
      'minlength': 'Comment must be at least 2 characters long.',
      'maxlength': 'Comment cannot be more than 32 characters long.'
    }
  }
  constructor(
    private dishService: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private formBuilder: FormBuilder,
    @Inject('BaseURL') private BaseURL) { }
    
    

    

  

  ngOnInit() {
    this.createForm();
    // const id = +this.route.snapshot.params['id'];
    // this.dishService.getDish(id).subscribe(dish => this.dish = dish);
    this.dishService.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.route.params.pipe(switchMap((params: Params) => this.dishService.getDish(+params['id'])))
      .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id); },
      errmess => this.errMess = <any>errmess);


  }
  goBack(): void {
    this.location.back();
  }

  setPrevNext(dishId: number) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }


  createForm() {

    this.feedbackForm = this.formBuilder.group({
      rating: [5, [Validators.required, Validators.max(5), Validators.min(1)]],
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(32)]],
      comment: ['', Validators.required],
      date: ''
    });

    this.feedbackForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  onValueChanged(data?: any) {
    if (!this.feedbackForm) { return; }
    const form = this.feedbackForm;
    for (const feild in this.formErrors) {
      this.formErrors[feild] = '';
      const control = form.get(feild);
      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[feild];
        for (const key in control.errors) {
          this.formErrors[feild] += messages[key] + ' ';
        }
      } else {
        this.comment = this.feedbackForm.value;
      }
    }
  }

  onSubmit() {
    this.comment = this.feedbackForm.value;
    this.comment.date = new Date().toISOString();

    // Log form Data for debugging 
    console.log(this.comment);

    // pushing new comment to the dish comments array
    this.dish.comments.push(this.comment);

    this.feedbackForm.reset({
      author: '',
      comment: '',
      rating: 5,
      date: ''
    });
  }

}