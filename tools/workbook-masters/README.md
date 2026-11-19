# Rebuilding a workbook part's .docx masters

Used on 18 Nov 2026 to apply the Part 7 amendments to the per-part masters in
Drive. The Drive connector can't overwrite a file, so the flow is: download the
current master, rebuild it here, upload the result as a new file beside the
original, and Karl swaps it in.

- `part7_content.py`: Part 7's content as blocks. `KEEP` copies unchanged
  sections straight from the original (by top-level element index), so
  untouched sections keep the master's own fuller wording and formatting.
  Everything else is written in the master's styles (Calibri, `•` bullets with
  a bold lead-in, yellow manager notes, blue worked examples, grey tables).
- `build.py MODE ORIGINAL_DOCUMENT_XML OUT_XML [TRAINER_DOCUMENT_XML]`:
  - `manager` builds the PT Manager Cheat Sheet.
  - `trainer` builds the PT Workbook from the same content: no manager notes or
    worked examples, "PT Workbook" as the subtitle, and the trainer original's
    answer-line counts (pass its `document.xml` as the fourth argument).
- The `KEEP` indices are positions in the **Cheat Sheet** original
  (`Part 7 - PT Manager Cheat Sheet.docx`, 8 Sep 2026). Run `split.py` over a
  different original and the indices will not match.

Steps: unzip the original, run the docx skill's `merge_runs.py` over it, run
`build.py`, drop the output in as `word/document.xml`, zip, validate with the
docx skill's `validate.py --original`, render to PDF and look at it, then
upload.
