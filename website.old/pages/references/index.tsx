import { GetStaticProps } from 'next';
import * as React from 'react';

import Metas from '../../components/Metas';
import ReferencesComponent, { ReferencesProps } from '../../components/References';
import { getReferences } from '../../services/references';

export const getStaticProps: GetStaticProps<ReferencesProps> = async () => {
  const references = await getReferences(0);
  return { props: { references } };
};

const References: React.FunctionComponent<React.PropsWithChildren<ReferencesProps>> = ({ references }) => {
  return (
    <>
      <Metas title="References - François Voron" />
      <ReferencesComponent references={references} />
    </>
  );
};

export default References;
