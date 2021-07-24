import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

import { useCalendly } from '../hooks/calendly';

interface FooterProps {
}

const Footer: React.FunctionComponent<FooterProps> = ({ }) => {
  const openCalendly = useCalendly();

  return (
    <footer className="footer-area footer-style-01 bg_color--6">
      <div className="im-call-to-action-area ptb--70 im-separator">
        <Container>
          <Row className="align-items-center">
            <Col xs={12} lg={8} xl={6}>
              <div className="inner">
                <h2 className="text-white mb--0">Let&#39;s work together and kick off your software project</h2>
              </div>
            </Col>
            <Col xs={12} lg={4} xl={{ span: 4, offset: 2 }}>
              <div className="text-left text-lg-right mt_md--20 mt_sm--20">
                <Button onClick={openCalendly} variant="default" size="lg" className="btn-large btn-border btn-opacity">Book a call</Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      <div className="footer-wrapper ptb--70">
        <Container>
          <Row>
            <Col xs={12} sm={6} md={6} lg={4}>
              <div className="ft-text">
                <div className="logo">
                  <Link href="/"><a><Image src="/logos/francois-voron.svg" alt="François Voron Logo" layout="fixed" width="150" height="50" /></a></Link>
                </div>
                <p>Made with ❤️ in 🇫🇷</p>
              </div>
            </Col>
            <Col xs={12} sm={6} md={6} lg={3}>
              <div className="footer-link">
                <h4>Contact me</h4>
                <ul className="ft-link">

                </ul>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
