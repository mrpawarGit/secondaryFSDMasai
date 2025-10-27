import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button, NavDropdown } from "react-bootstrap";
import { AuthContext } from "../../context/AuthContext";

const NavigationBar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <i className="bi bi-book me-2"></i>
          Collaborative LMS
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {/* Courses Link - Always visible */}
            <Nav.Link as={Link} to="/courses">
              <i className="bi bi-collection me-1"></i>
              Courses
            </Nav.Link>

            {user ? (
              <>
                <Nav.Link
                  as={Link}
                  to={
                    user.role === "instructor"
                      ? "/instructor-dashboard"
                      : "/student-dashboard"
                  }
                >
                  <i className="bi bi-speedometer2 me-1"></i>
                  Dashboard
                </Nav.Link>
                <NavDropdown
                  title={
                    <>
                      <i className="bi bi-person-circle me-1"></i>
                      {user.name}
                    </>
                  }
                  id="user-dropdown"
                  align="end"
                >
                  <NavDropdown.Item disabled>
                    <small className="text-muted">
                      <i className="bi bi-person-badge me-1"></i>
                      Role: <strong>{user.role}</strong>
                    </small>
                  </NavDropdown.Item>
                  <NavDropdown.Item disabled>
                    <small className="text-muted">
                      <i className="bi bi-envelope me-1"></i>
                      {user.email}
                    </small>
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-1"></i>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/signup">
                  <Button variant="outline-light" size="sm">
                    Sign Up
                  </Button>
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
