import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { saveAs } from 'file-saver';
import { ColorScheme } from '../model/color-scheme';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  cssContent: string | null = null;
  cssForm: FormGroup;

  fields: string[] = [];

  model: ColorScheme = {};

  constructor(private http: HttpClient) {
    this.cssForm = new FormGroup({});
  }

  ngOnInit() {
    this.http.get('styles.css', { responseType: 'text' }).subscribe((data) => {
      this.cssContent = data;
      this.extractCssVariables();
      this.buildForm();
    });
  }

  buildForm() {
    const formGroupFields = this.getFormControlsFields();
    this.cssForm = new FormGroup(formGroupFields);
  }

  getFormControlsFields() {
    const formGroupFields: any = {};
    for (const field of Object.keys(this.model)) {
      formGroupFields[field] = new FormControl(this.model[field]);
      this.fields.push(field);
    }
    return formGroupFields;
  }

  extractCssVariables() {
    if (this.cssContent) {
      const regex = /--([\w-]+):\s*([\w#]+)/g;
      let match;
      while ((match = regex.exec(this.cssContent)) !== null) {
        const [, variable, value] = match;
        this.model[variable.trim()] = value.trim();
      }
    }
  }

  onSubmit() {
    let newCssContent = ':root {\n';
    for (const control in this.cssForm.controls) {
      newCssContent += `  --${control}: ${this.cssForm.controls[control].value};\n`;
    }
    newCssContent += '}';

    const blob = new Blob([newCssContent], { type: 'text/css;charset=utf-8' });
    saveAs(blob, 'styles.css');
  }

  onAppendCss() {
    let newCssContent = ':root {\n';
    for (const control in this.cssForm.controls) {
      newCssContent += `  --${control}: ${this.cssForm.controls[control].value};\n`;
    }
    newCssContent += '}';
    const blob = new Blob([newCssContent], { type: 'text/css;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('link');
    link.href = url;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
}
