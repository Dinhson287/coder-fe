import { Component, ViewChild } from '@angular/core';
import { CodeExecutionService } from '../services/code-execution.service';
import { MonacoCodeEditorComponent } from './monaco-code-editor.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-code-runner',
  standalone: true,
  imports: [MonacoCodeEditorComponent,CommonModule],
  template: `
    <app-monaco-code-editor #codeEditor></app-monaco-code-editor>
    <button class="btn btn-primary mt-3" (click)="runCode()">Chạy code</button>
    <div *ngIf="output" class="mt-3">
      <h5>Kết quả:</h5>
      <pre>{{output}}</pre>
    </div>
  `
})
export class CodeRunnerComponent {
  @ViewChild('codeEditor') codeEditor!: MonacoCodeEditorComponent;
  output: string = '';

  constructor(private codeService: CodeExecutionService) {}

  runCode() {
    const code = this.codeEditor.getCode();
    this.codeService.submitCode(code, 71).subscribe(res => {
      this.output = res.stdout || res.stderr || res.compile_output || 'Không có kết quả trả về.';
    });
  }
}
