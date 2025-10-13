import { Container } from "react-bootstrap";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white py-3 mt-auto">
      <Container>
        <div className="text-center">
          <small>
            &copy; {currentYear} Collaborative LMS. All rights reserved.
          </small>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
