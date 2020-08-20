import {Exam} from './exam';

const DEMO_EXAM: Exam = {
  id: 420,
  date: new Date(),
  title: 'Demo Exam',
  questions: [
    {
      points: 5, elements: [
        'This task really asks the important questions about the alphabet.',
        {question: 'Is it A?', answer: true},
        {question: 'Is it B?', answer: false},
        {question: 'Is it C?', answer: true},
        {question: 'Is it D?', answer: false},
        'And finally:',
        {question: 'Is it E?', answer: true}
      ]
    },
    {
      points: 10, elements: [
        'Now let\'s try math: $\\sum_{i \\in \\set{N}}i$',
        {question: 'TODO: Latex stuff', answer: true},
        {question: 'TODO: Latex stuff', answer: false},
        {question: 'TODO: Latex stuff', answer: true},
        {question: 'TODO: Latex stuff', answer: false},
        {question: 'TODO: Latex stuff', answer: true},
        {question: 'TODO: Latex stuff', answer: false},
        {question: 'TODO: Latex stuff', answer: true},
        {question: 'TODO: Latex stuff', answer: false}
      ]
    }
  ]
};


export const FULL_EXAM: Exam = {
  id: 69,
  date: new Date(),
  title: 'Demo Exam',
  questions: [
    {
      points: 10, elements: [
        {question: 'Subquestion A', answer: true},
        {question: 'Subquestion B', answer: true},
        {question: 'Subquestion C', answer: true},
        {question: 'Subquestion D', answer: true},
        {question: 'Subquestion E', answer: true},
        {question: 'Subquestion F', answer: true},
        {question: 'Subquestion G', answer: true},
        {question: 'Subquestion H', answer: true},
        {question: 'Subquestion I', answer: true},
        {question: 'Subquestion J', answer: true},
      ]
    },
    {
      points: 10, elements: [
        {question: 'Subquestion A', answer: true},
        {question: 'Subquestion B', answer: true},
        {question: 'Subquestion C', answer: true},
        {question: 'Subquestion D', answer: true},
        {question: 'Subquestion E', answer: true},
        {question: 'Subquestion F', answer: true},
        {question: 'Subquestion G', answer: true},
        {question: 'Subquestion H', answer: true},
        {question: 'Subquestion I', answer: true},
        {question: 'Subquestion J', answer: true},
      ]
    },
    {
      points: 10, elements: [
        {question: 'Subquestion A', answer: true},
        {question: 'Subquestion B', answer: true},
        {question: 'Subquestion C', answer: true},
        {question: 'Subquestion D', answer: true},
        {question: 'Subquestion E', answer: true},
        {question: 'Subquestion F', answer: true},
        {question: 'Subquestion G', answer: true},
        {question: 'Subquestion H', answer: true},
        {question: 'Subquestion I', answer: true},
        {question: 'Subquestion J', answer: true},
      ]
    },
    {
      points: 10, elements: [
        {question: 'Subquestion A', answer: true},
        {question: 'Subquestion B', answer: true},
        {question: 'Subquestion C', answer: true},
        {question: 'Subquestion D', answer: true},
        {question: 'Subquestion E', answer: true},
        {question: 'Subquestion F', answer: true},
        {question: 'Subquestion G', answer: true},
        {question: 'Subquestion H', answer: true},
        {question: 'Subquestion I', answer: true},
        {question: 'Subquestion J', answer: true},
      ]
    },
    {
      points: 10, elements: [
        {question: 'Subquestion A', answer: true},
        {question: 'Subquestion B', answer: true},
        {question: 'Subquestion C', answer: true},
        {question: 'Subquestion D', answer: true},
        {question: 'Subquestion E', answer: true},
        {question: 'Subquestion F', answer: true},
        {question: 'Subquestion G', answer: true},
        {question: 'Subquestion H', answer: true},
        {question: 'Subquestion I', answer: true},
        {question: 'Subquestion J', answer: true},
      ]
    },
    {
      points: 10, elements: [
        {question: 'Subquestion A', answer: true},
        {question: 'Subquestion B', answer: true},
        {question: 'Subquestion C', answer: true},
        {question: 'Subquestion D', answer: true},
        {question: 'Subquestion E', answer: true},
        {question: 'Subquestion F', answer: true},
        {question: 'Subquestion G', answer: true},
        {question: 'Subquestion H', answer: true},
        {question: 'Subquestion I', answer: true},
        {question: 'Subquestion J', answer: true},
      ]
    },
    {
      points: 10, elements: [
        {question: 'Subquestion A', answer: true},
        {question: 'Subquestion B', answer: true},
        {question: 'Subquestion C', answer: true},
        {question: 'Subquestion D', answer: true},
        {question: 'Subquestion E', answer: true},
        {question: 'Subquestion F', answer: true},
        {question: 'Subquestion G', answer: true},
        {question: 'Subquestion H', answer: true},
        {question: 'Subquestion I', answer: true},
        {question: 'Subquestion J', answer: true},
      ]
    },
    {
      points: 10, elements: [
        {question: 'Subquestion A', answer: true},
        {question: 'Subquestion B', answer: true},
        {question: 'Subquestion C', answer: true},
        {question: 'Subquestion D', answer: true},
        {question: 'Subquestion E', answer: true},
        {question: 'Subquestion F', answer: true},
        {question: 'Subquestion G', answer: true},
        {question: 'Subquestion H', answer: true},
        {question: 'Subquestion I', answer: true},
        {question: 'Subquestion J', answer: true},
      ]
    },
    {
      points: 10, elements: [
        {question: 'Subquestion A', answer: true},
        {question: 'Subquestion B', answer: true},
        {question: 'Subquestion C', answer: true},
        {question: 'Subquestion D', answer: true},
        {question: 'Subquestion E', answer: true},
        {question: 'Subquestion F', answer: true},
        {question: 'Subquestion G', answer: true},
        {question: 'Subquestion H', answer: true},
        {question: 'Subquestion I', answer: true},
        {question: 'Subquestion J', answer: true},
      ]
    },
    {
      points: 10, elements: [
        {question: 'Subquestion A', answer: true},
        {question: 'Subquestion B', answer: true},
        {question: 'Subquestion C', answer: true},
        {question: 'Subquestion D', answer: true},
        {question: 'Subquestion E', answer: true},
        {question: 'Subquestion F', answer: true},
        {question: 'Subquestion G', answer: true},
        {question: 'Subquestion H', answer: true},
        {question: 'Subquestion I', answer: true},
        {question: 'Subquestion J', answer: true},
      ]
    }
  ]
};
