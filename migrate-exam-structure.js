const db = require('./src/model/index');
const { Op } = require('sequelize');

/**
 * Migration script to convert existing exam structure to hierarchical structure
 * This script will:
 * 1. Create domains and components based on existing exam components
 * 2. Update questions to reference component_id instead of component string
 * 3. Handle existing data gracefully
 */

async function migrateExamStructure() {
  try {
    console.log('Starting exam structure migration...');

    // Get all exams with their questions
    const exams = await db.Exam.findAll({
      include: [
        {
          model: db.Question
        }
      ]
    });

    console.log(`Found ${exams.length} exams to migrate`);

    for (const exam of exams) {
      console.log(`\nMigrating exam: ${exam.title} (ID: ${exam.id})`);

      // Determine components list: prefer exam.components (JSON array); fallback to question.component if present
      let uniqueComponents = Array.isArray(exam.components)
        ? [...new Set(exam.components.filter(Boolean).map(String))]
        : [];

      if (uniqueComponents.length === 0) {
        const fromQuestions = (exam.questions || [])
          .map(q => (q && q.dataValues ? q.dataValues.component : q && q.component))
          .filter(Boolean);
        uniqueComponents = [...new Set(fromQuestions.map(String))];
      }

      console.log(`Found components: ${uniqueComponents.join(', ')}`);

      if (uniqueComponents.length === 0) {
        console.log('No components found, skipping...');
        continue;
      }

      // Create a default domain for this exam
      const defaultDomain = await db.Domain.create({
        examId: exam.id,
        name: 'حیطه اصلی',
        description: 'حیطه پیش‌فرض برای آزمون',
        order: 0
      });

      console.log(`Created default domain: ${defaultDomain.name} (ID: ${defaultDomain.id})`);

      // Create components for each unique component
      const componentMap = {};
      for (let i = 0; i < uniqueComponents.length; i++) {
        const componentName = uniqueComponents[i];
        const component = await db.Component.create({
          domainId: defaultDomain.id,
          name: componentName,
          description: `مولفه ${componentName}`,
          order: i
        });

        componentMap[componentName] = component.id;
        console.log(`Created component: ${componentName} (ID: ${component.id})`);
      }

      // Update questions to reference component_id if legacy component field exists
      for (const q of (exam.questions || [])) {
        const legacyComponent = q && q.dataValues ? q.dataValues.component : q && q.component;
        if (legacyComponent && componentMap[legacyComponent]) {
          await q.update({ componentId: componentMap[legacyComponent] });
          console.log(`Updated question ${q.id} to use component_id: ${componentMap[legacyComponent]}`);
        }
      }
    }

    console.log('\nMigration completed successfully!');
    
    // Optional: Remove old component field (uncomment if you want to remove it)
    // console.log('Removing old component field...');
    // await db.sequelize.query('ALTER TABLE questions DROP COLUMN component');
    // console.log('Old component field removed');

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateExamStructure()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = migrateExamStructure;
