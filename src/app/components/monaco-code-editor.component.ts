import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Inject, PLATFORM_ID, ViewChild } from '@angular/core';

@Component({
  selector: 'app-monaco-code-editor',
  standalone: true,
  template: `<div #editorContainer style="height:400px;width:100%;border:1px solid #ccc;"></div>`,
})
export class MonacoCodeEditorComponent implements AfterViewInit {
  @ViewChild('editorContainer') editorContainer!: ElementRef;
  editorInstance!: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      (window as any).require.config({
        paths: { 'vs': 'assets/monaco-editor/min/vs' }
      });

      (window as any).require(['vs/editor/editor.main'], () => {
        this.editorInstance = (window as any).monaco.editor.create(this.editorContainer.nativeElement, {
          value: 'print("Hello World")',
          language: 'python',
          theme: 'vs-dark',
          automaticLayout: true,
          minimap: { enabled: false }
        });
      });
    }
  }

  getCode() {
    return this.editorInstance?.getValue();
  }
}
