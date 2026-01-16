import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Save, Check } from 'lucide-react';

interface LessonFormProps {
  pathId: string;
  lessonId: string;
  exerciseId: string;
  fields: FormField[];
  title?: string;
  onSave?: (data: Record<string, any>) => void;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'radio' | 'date';
  placeholder?: string;
  options?: string[];
  defaultValue?: any;
  required?: boolean;
  helpText?: string;
}

export default function LessonForm({ pathId, lessonId, exerciseId, fields, title, onSave }: LessonFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load existing response
  useEffect(() => {
    loadResponse();
  }, [user, lessonId, exerciseId]);

  const loadResponse = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('lesson_exercise_responses')
        .select('response_data')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .eq('exercise_id', exerciseId)
        .maybeSingle();

      if (error) throw error;

      if (data?.response_data) {
        setFormData(data.response_data as Record<string, any>);
      } else {
        // Initialize with default values
        const defaults: Record<string, any> = {};
        fields.forEach(field => {
          if (field.defaultValue !== undefined) {
            defaults[field.id] = field.defaultValue;
          }
        });
        setFormData(defaults);
      }
    } catch (error) {
      console.error('Error loading response:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('lesson_exercise_responses')
        .upsert({
          user_id: user.id,
          path_id: pathId,
          lesson_id: lessonId,
          exercise_id: exerciseId,
          response_data: formData,
        }, {
          onConflict: 'user_id,lesson_id,exercise_id'
        });

      if (error) throw error;

      setSaved(true);
      if (onSave) onSave(formData);

      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving response:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.id] ?? '';

    const baseClasses = "w-full px-4 py-3 bg-white border border-black text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black font-medium";

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={`${baseClasses} min-h-[100px] resize-y`}
            required={field.required}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={baseClasses}
            required={field.required}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className={`${baseClasses} cursor-pointer`}
            required={field.required}
          >
            <option value="">SELECT AN OPTION...</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-3 p-3 bg-white border border-black">
            <input
              type="checkbox"
              checked={value === true}
              onChange={(e) => handleChange(field.id, e.target.checked)}
              className="w-5 h-5 border border-black cursor-pointer"
              required={field.required}
            />
            <span className="text-sm font-semibold uppercase tracking-tight">{field.label}</span>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map(option => (
              <label key={option} className="flex items-center space-x-3 p-3 bg-white border border-black cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  className="w-5 h-5 border border-black cursor-pointer"
                  required={field.required}
                />
                <span className="text-sm font-medium">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className={baseClasses}
            required={field.required}
          />
        );

      default: // text
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={baseClasses}
            required={field.required}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-black p-6 shadow-[2px_2px_0px_#000000]">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 border border-black w-3/4"></div>
          <div className="h-10 bg-gray-200 border border-black"></div>
          <div className="h-10 bg-gray-200 border border-black"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF9E6] border border-black p-6 shadow-[2px_2px_0px_#000000] space-y-6">
      {title && (
        <h3 className="text-xl font-extrabold text-black uppercase tracking-tight">{title}</h3>
      )}

      <div className="space-y-5">
        {fields.map(field => (
          <div key={field.id} className="space-y-2">
            {field.type !== 'checkbox' && (
              <label className="block text-sm font-extrabold text-black uppercase tracking-tight">
                {field.label}
                {field.required && <span className="text-[#FF6A00] ml-1">*</span>}
              </label>
            )}
            {renderField(field)}
            {field.helpText && (
              <p className="text-xs text-gray-700 italic mt-1">{field.helpText}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t-2 border-black">
        <button
          onClick={handleSave}
          disabled={saving || !user}
          className={`flex items-center gap-2 px-6 py-3 border border-black font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            saved
              ? 'bg-[#00D084] text-black'
              : 'bg-black text-white'
          }`}
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" strokeWidth={2} />
              <span>SAVED!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" strokeWidth={2} />
              <span>{saving ? 'SAVING...' : 'SAVE PROGRESS'}</span>
            </>
          )}
        </button>

        {!user && (
          <p className="text-xs font-semibold text-[#FF6A00] uppercase tracking-tight">Sign in to save</p>
        )}
      </div>
    </div>
  );
}
