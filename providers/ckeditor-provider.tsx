/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from 'react';
// import { SourceEditing } from "@ckeditor/ckeditor5-source-editing";
// import Alignment from "@ckeditor/ckeditor5-alignment/src/alignment";

// FIXME https://ckeditor.com/docs/ckeditor5/latest/installation/integrations/next-js.html

interface CKeditorProps {
  value: string | null;
  setValue: (data: string) => void;
  rtl?: boolean;
}
export default function CKeditorComponent({
  value,
  setValue,
  rtl = false,
}: CKeditorProps) {
  const [loaded, setLoaded] = useState(false);

  // @ts-expect-error commment comment
  const editorRef = useRef<any>();
  const { CKEditor, ClassicEditor } = editorRef.current || {}; // if it don't find any document then it will be an empty object

  const editorConfiguration = {
    language: {
      ui: rtl ? 'ar' : 'en',
      content: rtl ? 'ar' : 'en',
    },
    height: '300px',
    alignment: {
      options: ['left', 'right'],
    },
    // plugins: [SourceEditing],
    mediaEmbed: {
      previewsInData: true,
    },
    toolbar: [
      'heading',
      '|',
      'bold',
      'italic',
      'link',
      '|',
      '|',
      'alignment',
      '|',
      '|',
      'bulletedList',
      'numberedList',
      'blockQuote',
      'insertTable',
      '|',
      'outdent',
      'indent',
      '|',
      'pageBreak',
      'horizontalLine',
      'undo',
      'redo',
      'sourceEditing',
    ],
  };

  useEffect(() => {
    editorRef.current = {
      CKEditor: require('@ckeditor/ckeditor5-react').CKEditor, // v3+
      ClassicEditor: require('@ckeditor/ckeditor5-build-classic'),
    };
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (editorRef.current?.editorInstance) {
      // If RTL prop changes, update the editor instance
      editorRef.current.editorInstance.editing.view.document.set(
        'languageDirection',
        rtl ? 'rtl' : 'ltr'
      );
    }
  }, [rtl]);

  return (
    <>
      {loaded ? (
        <CKEditor
          editor={ClassicEditor}
          data={value}
          onChange={(event: any, editor: any) => {
            const data = editor.getData();
            setValue(data);
          }}
          config={editorConfiguration}
          onReady={(editor: any) => {
            // You can store the "editor" and use when it is needed.
            // console.log('Editor is ready to use!', editor);
            editor.editing.view.change((writer: any) => {
              writer.setStyle(
                'min-height',
                '300px',
                editor.editing.view.document.getRoot()
              );
              writer.setStyle(
                'padding',
                '0 40px',
                editor.editing.view.document.getRoot()
              );
            });
          }}
          onBlur={(event: any, editor: any) => {
            // console.log('Blur.', editor);
          }}
          onFocus={(event: any, editor: any) => {
            // console.log('Focus.', editor);
          }}
        />
      ) : (
        <div className="animate-pulse font-fira text-xl">Loading...</div>
      )}
    </>
  );
}
