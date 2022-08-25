import React from 'react';

interface Expertise {
  icon: string;
  title: string;
  description: string;
}

const EXPERTISES: Expertise[] = [
  { icon: '⚙️', title: 'Backend development', description: 'FastAPI • Django • Flask' },
  { icon: '🎨', title: 'Frontend development', description: 'React • Next.js • Angular' },
  { icon: '☁️', title: 'Cloud computing', description: 'Amazon Web Services • Google Cloud Platform • Microsoft Azure' },
  { icon: '💾', title: 'Data engineering', description: 'Extraction • Processing • Storage' },
  { icon: '🧠', title: 'Machine learning', description: 'Scikit-learn • OpenCV' },
  { icon: '🔍', title: 'Information retrieval', description: 'Natural Language Processing • Elasticsearch' },
]

const Expertises: React.FunctionComponent<React.PropsWithChildren<unknown>> = () => {
  return (
    <section className="relative">

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-12 md:py-20">

          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
            <h2 className="h2 mb-4">My area of expertises</h2>
            <p className="text-xl text-gray-400">Challenging startups environment allowed me to use and master the best and latest technologies in ever-changing software development ecosystems.</p>
          </div>

          <div className="max-w-sm mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start md:max-w-2xl lg:max-w-none">
            {EXPERTISES.map((expertise) =>
              <div key={expertise.title} className="relative flex flex-col items-center p-6 ring-2 ring-opacity-75 ring-red-500 rounded h-48">
                <span className="text-4xl">{expertise.icon}</span>
                <h3 className="text-xl font-bold leading-snug tracking-tight mb-1">{expertise.title}</h3>
                <p className="text-gray-400 text-center">{expertise.description}</p>
              </div>
            )}
          </div>

        </div>
      </div>

    </section>
  );
}

export default Expertises;
