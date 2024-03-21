import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  cssContent: string | null = null;
  cssForm: FormGroup;

  constructor(private http: HttpClient) {
    this.cssForm = new FormGroup({
      'primary-color': new FormControl('#000000'),
      'secondary-color': new FormControl('#000000'),
      'accent-color': new FormControl('#000000'),
      'divider-color': new FormControl('#000000')
    });
  }

  ngOnInit() {
    this.http.get('styles.css', {responseType: 'text'}).subscribe(data => {
      this.cssContent = data;
      console.log(this.cssContent);
      const cssVariables = this.cssContent.match(/--\w+:\s#[0-9a-fA-F]{6};/g);
      cssVariables?.forEach(variable => {
        const [name, value] = variable.split(':');
        const controlName = name.trim().substring(2);
        this.cssForm.controls[controlName].setValue(value.trim().substring(0, value.length - 1));
      });
    });
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
}
