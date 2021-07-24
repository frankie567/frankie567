import Image from 'next/image';
import * as React from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

import { useCalendly } from '../hooks/calendly';

const Home: React.FunctionComponent = () => {
  const openCalendly = useCalendly();

  return (
    <>
    <div>
      <div className="slide personal-portfolio-slider slider-paralax slider-style-3 d-flex align-items-center justify-content-center bg_image bg_image--25">
        <Container>
          <Row>
            <Col lg={12}>
              <div className="inner text-md-left text-center"><span>Developer / Data Scientist / Entrepreneur</span>
                <h1 className="title">I&#39;m François Voron<br />
                  <span>Offroad developer</span>
                </h1>
                <h2>Make your software projects successful</h2>
                <div className="slide-btn mt--30">
                  <Button onClick={openCalendly} variant="default" className="btn-default btn-border btn-opacity">Book a call</Button>
                </div>
              </div>
            </Col>
          </Row>
          <Row className="mt-5">
            <Col className="d-flex justify-content-center mb-5 mb-lg-0">
              <Image src="/logos/google.svg" alt="Google" layout="fixed" width="150" height="50" />
            </Col>
            <Col className="d-flex justify-content-center mb-5 mb-lg-0">
              <Image src="/logos/google.svg" alt="Google" layout="fixed" width="150" height="50" />
            </Col>
            <Col className="d-flex justify-content-center mb-5 mb-lg-0">
              <Image src="/logos/google.svg" alt="Google" layout="fixed" width="150" height="50" />
            </Col>
            <Col className="d-flex justify-content-center mb-5 mb-lg-0">
              <Image src="/logos/google.svg" alt="Google" layout="fixed" width="150" height="50" />
            </Col>
          </Row>
        </Container>
      </div>
    </div>
    <div>
      <div className="about-area ptb--120 bg_color--8">
        <div className="about-wrapper">
          <Container>
            <Row className="row--35">
              <Col lg={5}>
                <div className="thumbnail"></div>
              </Col>
              <Col lg={7}>
                <div className="about-inner inner">
                  <div className="section-title">
                    <span className="subtitle">Foobar</span>
                    <h2 className="title mb--20">About</h2>
                    <p className="description mt_dec--20">Lorem ispum</p>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    </div>
    </>
  );
};

export default Home;
