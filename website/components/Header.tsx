import Image from 'next/image';
import Link from 'next/link';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import * as React from 'react';

interface HeaderProps {
}

const Header: React.FunctionComponent<HeaderProps> = ({ }) => {
  return (
    <Navbar as="header" variant="dark" bg="transparent" expand="lg" className="header-area header-style-two header--fixed header--sticky color-black">
      <div className="header-wrapper w-100">
        <Navbar.Brand className="logo mr--50">
          <Link href="/"><a><Image src="/logos/francois-voron.svg" alt="François Voron Logo" layout="fixed" width="150" height="50" /></a></Link>
        </Navbar.Brand>
        <Navbar.Toggle className="btn-primary" />
        <Navbar.Collapse id="basic-navbar-nav" >
          <div className="mainmenunav">
            <Nav as="ul" className="mainmenu">
              <Nav.Item as="li">
                <Link href="/" passHref><Nav.Link className="smoth-animation active">Home</Nav.Link></Link>
              </Nav.Item>
              <Nav.Item as="li">
                <Link href="/" passHref><Nav.Link className="smoth-animation">Home</Nav.Link></Link>
              </Nav.Item>
              <Nav.Item as="li">
                <Link href="/" passHref><Nav.Link className="smoth-animation">Home</Nav.Link></Link>
              </Nav.Item>
            </Nav>
          </div>
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
};

export default Header;
