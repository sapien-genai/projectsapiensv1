# Interactive Prompt Forms Feature

## Overview

The Prompt Library now features an **Interactive Prompt Builder** that transforms static prompts into dynamic, form-based experiences. Users fill out structured form fields instead of editing raw prompt text, making prompt engineering more approachable and educational.

## How It Works

### For Prompt Creators

When creating prompts in the library, use `{variable_name}` syntax to define fillable fields:

```
You are an expert email communicator.

EMAIL DRAFT:
{email_draft}

TONE PREFERENCE:
{tone}

AUDIENCE:
{audience}

Please enhance this email...
```

### For Users Testing Prompts

When clicking "TEST" on a prompt with variables:

1. **Form Fields Appear**: Each `{variable_name}` becomes a labeled textarea
2. **Smart Labels**: Variables are converted to readable labels (e.g., `{email_draft}` → "Email Draft")
3. **Fill Example Button**: Instantly populates all fields with sample data
4. **Live Preview**: Toggle on/off to see the complete prompt with your values
5. **Send to AI**: Submit the customized prompt to test the output

## Features

### Interactive Elements

- **Form Fields**: Auto-generated from prompt variables
- **Fill Example**: One-click sample data insertion
- **Reset Button**: Clear all fields to start fresh
- **Live Preview**: See the complete prompt with your values in real-time
- **Validation**: Must fill at least one field to send

### Smart Variable Detection

The system automatically:
- Extracts all `{variable_name}` patterns
- Creates unique fields (no duplicates)
- Generates helpful placeholders
- Converts snake_case to Title Case labels

### Educational Benefits

- **Learn Prompt Structure**: See how variables work in prompts
- **Experiment Safely**: Try different values without editing the template
- **Understand Components**: Break down complex prompts into parts
- **Build Skills**: Learn what makes effective prompts

## Updating Prompts with Variables

### Current Status

The database may contain old prompts without variables. To update:

1. Go to **Prompt Library**
2. Click the **"UPDATE PROMPTS"** button (orange, top-right)
3. All prompts will be updated with the latest variable-based versions
4. Click "TEST" on any prompt to see the interactive form

### Prompts with Variables

The following prompts now have interactive forms:

- **Email Enhancement Wizard**: `{email_draft}`, `{tone}`, `{audience}`
- **Meeting Agenda Architect**: `{meeting_purpose}`, `{duration}`, `{attendees}`, `{key_topics}`
- **Learning Path Designer**: `{skill}`, `{current_level}`, `{target_level}`, `{time_available}`, `{learning_style}`
- **Creative Brainstorm Facilitator**: `{challenge}`, `{context}`, `{constraints}`, `{target_audience}`
- **Decision Framework Builder**: `{decision}`, `{options}`, `{stakeholders}`, `{factors}`, `{timeframe}`

## Creating Variable-Based Prompts

### Best Practices

1. **Use Clear Names**: `{email_draft}` not `{d}`
2. **Group Related Variables**: Keep similar fields together
3. **Provide Context**: Add labels before variables
4. **Use Descriptive Names**: Help users understand what to fill in
5. **Keep It Simple**: 3-7 variables is ideal

### Example Template

```
You are a [role]. Your task is to [action].

INPUT:
{main_input}

STYLE:
{style_preference}

CONSTRAINTS:
{constraints}

OUTPUT FORMAT:
{output_format}

Please [specific instructions]...
```

### Variable Naming Conventions

- Use lowercase with underscores: `{user_input}`
- Be specific: `{target_audience}` not `{audience}`
- Indicate type if helpful: `{time_available}`, `{budget_limit}`
- Keep under 20 characters when possible

## Technical Implementation

### Variable Detection

```typescript
const extractVariables = (prompt: string): PromptVariable[] => {
  const variablePattern = /\{([^}]+)\}/g;
  const matches = [...prompt.matchAll(variablePattern)];
  // ... creates unique fields with labels
};
```

### Prompt Building

```typescript
const buildPromptFromVariables = (): string => {
  let builtPrompt = originalPrompt;
  Object.keys(variableValues).forEach(key => {
    const value = variableValues[key] || `{${key}}`;
    builtPrompt = builtPrompt.replace(
      new RegExp(`\\{${key}\\}`, 'g'),
      value
    );
  });
  return builtPrompt;
};
```

## Future Enhancements

Potential improvements:

- Field type hints (text, number, select)
- Character limits per field
- Required vs optional fields
- Save filled forms for reuse
- Share customized prompts
- Field descriptions/help text
- Default values for variables
- Conditional fields based on other values

## User Experience Flow

1. **Browse Prompts** → See prompt cards in library
2. **Click "TEST"** → Opens tester with form or raw text
3. **Fill Form** → Complete relevant fields
4. **Preview** → Toggle to see final prompt
5. **Send** → Submit to AI and see response
6. **Iterate** → Adjust values and test again
7. **Learn** → Understand what makes prompts effective

## Benefits

### For Learners
- Understand prompt anatomy
- Experiment with variations
- Build confidence gradually
- See patterns in effective prompts

### For Power Users
- Quickly customize templates
- Maintain consistency
- Share reusable structures
- Collaborate on prompts

### For Educators
- Teach prompt engineering
- Demonstrate best practices
- Create guided exercises
- Track student progress

---

This feature transforms the Prompt Library from a static collection into an interactive learning environment where users actively engage with and understand the mechanics of effective AI prompting.
