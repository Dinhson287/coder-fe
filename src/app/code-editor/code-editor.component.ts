import { Component } from '@angular/core';
import { CodeRunnerComponent } from '../components/code-runner.component';

@Component({
  selector: 'app-code-editor',
  standalone: true,
  imports: [CodeRunnerComponent],
  templateUrl: './code-editor.component.html',
  styleUrl: './code-editor.component.scss'
})
export class CodeEditorComponent {

}
