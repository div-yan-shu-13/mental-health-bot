import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const activities = [
  'Exercise', 'Reading', 'Meditation', 'Socializing', 
  'Work', 'Study', 'Entertainment', 'Outdoors', 
  'Creative', 'Family', 'Sleep', 'Travel'
];

// Validation schema
const MoodSchema = Yup.object().shape({
  mood_score: Yup.number()
    .required('Please select a mood score')
    .min(1, 'Score must be at least 1')
    .max(10, 'Score must be at most 10'),
  notes: Yup.string()
    .max(500, 'Notes should be less than 500 characters'),
});

interface MoodFormProps {
  onSubmit: (values: {mood_score: number, notes?: string, activities?: string[]}) => Promise<void>;
}

const MoodForm: React.FC<MoodFormProps> = ({ onSubmit }) => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  
  const moods = [
    { score: 1, emoji: '😢', label: 'Terrible' },
    { score: 3, emoji: '😕', label: 'Bad' },
    { score: 5, emoji: '😐', label: 'Neutral' },
    { score: 7, emoji: '🙂', label: 'Good' },
    { score: 10, emoji: '😄', label: 'Amazing' },
  ];
  
  return (
    <div className="mood-form">
      <Formik
        initialValues={{
          mood_score: 0,
          notes: '',
          activities: [] as string[]
        }}
        validationSchema={MoodSchema}
        onSubmit={async (values, { resetForm, setSubmitting }) => {
          try {
            await onSubmit(values);
            resetForm();
            setSelectedMood(null);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ setFieldValue, isSubmitting, values }) => (
          <Form>
            {/* Mood Selection */}
            <div className="mood-selection">
              {moods.map(mood => (
                <div 
                  key={mood.score}
                  className={`mood-option ${selectedMood === mood.score ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedMood(mood.score);
                    setFieldValue('mood_score', mood.score);
                  }}
                >
                  <div className="mood-emoji">{mood.emoji}</div>
                  <div className="mood-label">{mood.label}</div>
                </div>
              ))}
            </div>
            
            <ErrorMessage name="mood_score" component="div" className="error" />
            
            {/* Notes Field */}
            <div className="form-group">
              <label htmlFor="notes">Notes (optional)</label>
              <Field
                as="textarea"
                name="notes"
                placeholder="How are you feeling? What's on your mind?"
                className="form-control"
              />
              <ErrorMessage name="notes" component="div" className="error" />
            </div>
            
            {/* Activities Checkboxes */}
            <div className="form-group">
              <label>Activities (optional)</label>
              <div className="activities-list">
                {activities.map(activity => (
                  <div key={activity} className="activity-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        name="activities"
                        value={activity}
                        checked={values.activities.includes(activity)}
                        onChange={e => {
                          const isChecked = e.target.checked;
                          const currentActivities = [...values.activities];
                          
                          if (isChecked) {
                            currentActivities.push(activity);
                          } else {
                            const index = currentActivities.indexOf(activity);
                            if (index !== -1) {
                              currentActivities.splice(index, 1);
                            }
                          }
                          
                          setFieldValue('activities', currentActivities);
                        }}
                      />
                      {activity}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isSubmitting || !selectedMood} 
              className="btn btn-primary submit-mood"
            >
              {isSubmitting ? 'Saving...' : 'Log Mood'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default MoodForm;
