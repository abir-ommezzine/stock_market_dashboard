"use client"

import { CircleHelp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'

type FaqItem = {
  value: string
  question: string
  answer: string
}

const faqItems: FaqItem[] = [
  {
    value: 'item-1',
    question: 'How do I use Stocky prediction features?',
    answer:
      'Using Stocky is simple! Upload your stock data or connect to our API, select your prediction model (ARIMA, SARIMA, or ARMA), and let our AI analyze the data. Each prediction comes with detailed metrics and visualizations to help you make informed decisions.',
  },
  {
    value: 'item-2',
    question: 'What\'s the difference between free and premium components?',
    answer:
      'Free components include essential UI elements like buttons, forms, and basic layouts. Premium components offer advanced features like complex data tables, analytics dashboards, authentication flows, and complete admin templates. Premium also includes Figma files, priority support, and commercial licenses.',
  },
  {
    value: 'item-3',
    question: 'Can I use these components in commercial projects?',
    answer:
      'Yes! Free components come with an MIT license for unlimited use. Premium components include a commercial license that allows usage in client projects, SaaS applications, and commercial products without attribution requirements.',
  },
  {
    value: 'item-4',
    question: 'Do you provide support and updates?',
    answer:
      'Absolutely! We provide comprehensive support through our documentation and email support. We regularly update our prediction models with the latest market data and continuously improve our algorithms. Premium users get priority support and early access to new features.',
  },
  {
    value: 'item-5',
    question: 'What technologies power Stocky?',
    answer:
      'Stocky is built with React, TypeScript, and Tailwind CSS for the frontend. Our prediction engine uses Python with advanced time series models (ARIMA, SARIMA, ARMA) and machine learning algorithms. We use PostgreSQL for data storage and FastAPI for our backend services.',
  },
  {
    value: 'item-6',
    question: 'How often do you release new components?',
    answer:
      'We release new components and templates weekly. Premium subscribers get early access to new releases, while free components are updated regularly based on community feedback. You can track our roadmap and request specific components through our GitHub repository.',
  },
]

const FaqSection = () => {
  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">FAQ</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about Stocky predictions, features, and integration. Still have questions? We're here to help!
          </p>
        </div>

        {/* FAQ Content */}
        <div className="max-w-4xl mx-auto">
          <div className='bg-transparent'>
            <div className='p-0'>
              <Accordion type='single' collapsible className='space-y-5'>
                {faqItems.map(item => (
                  <AccordionItem key={item.value} value={item.value} className='rounded-md !border bg-transparent'>
                    <AccordionTrigger className='cursor-pointer items-center gap-4 rounded-none bg-transparent py-2 ps-3 pe-4 hover:no-underline data-[state=open]:border-b'>
                      <div className='flex items-center gap-4'>
                        <div className='bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full'>
                          <CircleHelp className='size-5' />
                        </div>
                        <span className='text-start font-semibold'>{item.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className='p-4 bg-transparent'>{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Contact Support CTA */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Still have questions? We're here to help.
            </p>
            <Button className='cursor-pointer' asChild>
              <a href="#contact">
                Contact Support
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export { FaqSection }
