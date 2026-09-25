---
name: "study-guide-builder"
description: "Turn supplied course materials (lecture notes, lecture slides) into a comprehensive study guide filled with key ideas/concepts, term definitions, and a summary of what was covered. Use when the user asks to create a study guide for a class. This skill will create a study guide that can be exported to Microsoft Word to be printed out as extra study material for classes."
---

# study-guide-builder

## User inputs
On each run, the user supplies any course material that they would like to be used to create the study guide. If no material has been uploaded, ask the user to upload the content that they want to use in the creation of the study guide before continuing.

## Procedure
1. Read all of the supplied course content

## Output
Return with a comprehensive study guide filled with the key ideas, concepts, terms, definitions and a generated summary at the end that is based on the course content covered.

## Boundaries
Do not use any outside resources or make up any content used in the generation of the study guide.
Any content that is used in the creation of the study guide should only come from the content that the user supplied.
The draft should be editable by the user before it can be exported to Word for printing.
