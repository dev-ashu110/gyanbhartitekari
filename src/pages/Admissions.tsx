import { FileDown, CheckCircle, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Admissions() {
  const steps = [
    {
      step: '01',
      title: 'Download Application Form',
      description: 'Get the admission form by clicking the download button below or visit our office.',
    },
    {
      step: '02',
      title: 'Fill Required Details',
      description: 'Complete all sections of the form with accurate information and attach necessary documents.',
    },
    {
      step: '03',
      title: 'Submit Application',
      description: 'Submit the completed form along with required documents at our school office.',
    },
    {
      step: '04',
      title: 'Entrance Assessment',
      description: 'Attend the scheduled entrance assessment and interaction session.',
    },
    {
      step: '05',
      title: 'Admission Confirmation',
      description: 'Receive admission confirmation and complete fee payment within the given timeframe.',
    },
  ];

  const documents = [
    'Birth certificate (original and photocopy)',
    'Transfer certificate from previous school',
    'Previous year mark sheets/report cards',
    'Passport size photographs (4 copies)',
    'Aadhar card copy (student and parents)',
    'Caste certificate (if applicable)',
    'Income certificate (for fee concession)',
  ];

  return (
    <main className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom duration-1000">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gradient">Admissions</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Begin your journey with us. Admissions are now open for the upcoming academic year.
          </p>
        </div>

        {/* Download Form Section */}
        <Card className="glass-strong p-8 md:p-12 rounded-3xl mb-16 text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Download Admission Form</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get started by downloading our admission form. Fill it carefully and submit it to our office
            with all required documents.
          </p>
          <Button size="lg" className="rounded-full text-lg px-8">
            <FileDown className="mr-2 h-5 w-5" />
            Download Form (PDF)
          </Button>
        </Card>

        {/* Admission Steps */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-12 text-center text-gradient">Admission Process</h2>
          <div className="space-y-6">
            {steps.map((item, index) => (
              <Card
                key={item.step}
                className="glass p-6 md:p-8 rounded-3xl hover:glass-strong transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">{item.step}</span>
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-2xl font-bold mb-2 text-foreground">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                  <CheckCircle className="hidden md:block h-8 w-8 text-primary flex-shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Required Documents */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <Card className="glass-strong p-8 rounded-3xl">
            <h2 className="text-3xl font-bold mb-6 text-foreground">Required Documents</h2>
            <ul className="space-y-3">
              {documents.map((doc, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{doc}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="glass-strong p-8 rounded-3xl">
            <h2 className="text-3xl font-bold mb-6 text-foreground">Important Information</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">Age Criteria:</strong> Students must meet the age requirements
                as per state board guidelines for their respective classes.
              </p>
              <p>
                <strong className="text-foreground">Admission Test:</strong> An entrance assessment will be conducted
                to evaluate the student's academic level and readiness.
              </p>
              <p>
                <strong className="text-foreground">Limited Seats:</strong> Admissions are granted on a first-come,
                first-served basis. Early application is recommended.
              </p>
              <p>
                <strong className="text-foreground">Fee Structure:</strong> Detailed fee structure will be provided
                during the admission process. Fee concessions are available for eligible students.
              </p>
            </div>
          </Card>
        </div>

        {/* Contact Section */}
        <Card className="glass-strong p-8 md:p-12 rounded-3xl text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Need Assistance?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our admissions team is here to help you through the process. Feel free to reach out to us.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild variant="outline" size="lg" className="rounded-full glass">
              <a href="tel:+919431448688">
                <Phone className="mr-2 h-5 w-5" />
                Call Us
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full glass">
              <a href="mailto:info@gyanbhartitekari.com">
                <Mail className="mr-2 h-5 w-5" />
                Email Us
              </a>
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
