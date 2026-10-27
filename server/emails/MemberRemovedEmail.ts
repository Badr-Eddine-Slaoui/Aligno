import { defineComponent, h } from 'vue'
import {
  EHtml,
  EHead,
  EBody,
  EContainer,
  ESection,
  EHeading,
  EText,
  EHr,
} from 'vue-email'

export const MemberRemovedEmail = defineComponent({
  props: {
    firstName: {
      type: String,
      required: true,
    },
    projectName: {
      type: String,
      required: true,
    },
    removerName: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    return () =>
      h(EHtml, { lang: 'en' }, {
        default: () => [
          h(EHead),
          h(
            EBody,
            {
              style: {
                backgroundColor: '#f4f4f7',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                padding: '40px 20px',
              },
            },
            {
              default: () => [
                h(
                  EContainer,
                  {
                    style: {
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                      overflow: 'hidden',
                      maxWidth: '560px',
                      margin: '0 auto',
                    },
                  },
                  {
                    default: () => [
                      h(
                        ESection,
                        {
                          style: {
                            background: 'linear-gradient(135deg, #4b5563, #1f2937)',
                            padding: '32px',
                            textAlign: 'center',
                          },
                        },
                        {
                          default: () => [
                            h(
                              EHeading,
                              {
                                style: {
                                  margin: 0,
                                  color: '#ffffff',
                                  fontSize: '28px',
                                  fontWeight: 'bold',
                                  letterSpacing: '-0.5px',
                                },
                              },
                              { default: () => 'Aligno' }
                            ),
                          ],
                        }
                      ),
                      h(
                        ESection,
                        { style: { padding: '40px 32px' } },
                        {
                          default: () => [
                            h(
                              EHeading,
                              {
                                style: {
                                  margin: '0 0 16px 0',
                                  fontSize: '22px',
                                  color: '#1f2937',
                                  fontWeight: '600',
                                },
                              },
                              { default: () => `Hi ${props.firstName}` }
                            ),
                            h(
                              EText,
                              {
                                style: {
                                  fontSize: '16px',
                                  lineHeight: '26px',
                                  color: '#4b5563',
                                  margin: '0 0 28px 0',
                                },
                              },
                              {
                                default: () =>
                                  `This email is to notify you that you have been removed from the project "${props.projectName}" by ${props.removerName}.`,
                              }
                            ),
                            h(EHr, {
                              style: {
                                borderColor: '#e5e7eb',
                                margin: '32px 0 24px 0',
                              },
                            }),
                            h(
                              EText,
                              {
                                style: {
                                  fontSize: '13px',
                                  color: '#9ca3af',
                                  lineHeight: '20px',
                                  margin: 0,
                                },
                              },
                              {
                                default: () =>
                                  "If you believe this was an error, please reach out directly to the project administrator.",
                              }
                            ),
                          ],
                        }
                      ),
                      h(
                        ESection,
                        {
                          style: {
                            backgroundColor: '#f9fafb',
                            padding: '24px 32px',
                            textAlign: 'center',
                          },
                        },
                        {
                          default: () => [
                            h(
                              EText,
                              {
                                style: {
                                  fontSize: '12px',
                                  color: '#9ca3af',
                                  margin: 0,
                                },
                              },
                              {
                                default: () =>
                                  `© ${new Date().getFullYear()} Aligno. All rights reserved.`,
                              }
                            ),
                          ],
                        }
                      ),
                    ],
                  }
                ),
              ],
            }
          ),
        ],
      })
  },
})
