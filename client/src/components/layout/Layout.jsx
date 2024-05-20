import React from "react";
import Footer from "../footer/Footer.jsx";
import Header from "../header/Header.jsx";

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <div className="--pad" style={{ minHeight: "80vh" }}>
        {children}
      </div>
      <Footer />
    </>
  );
};

export default Layout;
