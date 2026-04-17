export const EMPLOYEE_ROLES = {
  admin: {
    key: 'admin',
    label: 'Admin',
    description: 'Controls employee accounts, role access, and dashboard oversight.',
    accentClass: 'employee-dashboard__badge--admin',
    summary: 'Full platform control and employee management access.',
    modules: [
      'Create and manage reporter, SEO, and editor employee accounts',
      'Assign role permissions and reset passwords',
      'Monitor publishing workflow, approvals, and team activity',
    ],
  },
  reporter: {
    key: 'reporter',
    label: 'Reporter',
    description: 'Creates stories, drafts field updates, and submits content for review.',
    accentClass: 'employee-dashboard__badge--reporter',
    summary: 'Story drafting, assignments, and reporting workflow.',
    modules: [
      'Create article drafts and upload field notes',
      'Track assignment status and newsroom deadlines',
      'Send stories to editor review',
    ],
  },
  seo: {
    key: 'seo',
    label: 'SEO',
    description: 'Optimizes article metadata, keyword plans, and content discoverability.',
    accentClass: 'employee-dashboard__badge--seo',
    summary: 'Search optimization, metadata control, and ranking visibility.',
    modules: [
      'Manage keywords, titles, and meta descriptions',
      'Review performance trends and search visibility',
      'Recommend optimization updates before publishing',
    ],
  },
  editor: {
    key: 'editor',
    label: 'Editor',
    description: 'Reviews drafts, approves stories, and controls final publishing quality.',
    accentClass: 'employee-dashboard__badge--editor',
    summary: 'Editorial review, publishing approvals, and content quality checks.',
    modules: [
      'Review reporter drafts and request revisions',
      'Approve stories for publication',
      'Maintain editorial quality and publishing standards',
    ],
  },
}

export const EMPLOYEE_ROLE_ORDER = ['admin', 'reporter', 'seo', 'editor']
