import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-python-tool',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './python-tool.component.html',
  styleUrl: './python-tool.component.scss'
})
export class PythonToolComponent {

  confirm: boolean = false;

  current: number = 1;

  constructor() { }

}
