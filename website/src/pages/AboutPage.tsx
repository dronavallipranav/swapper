function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-center mb-4">About Us</h1>
      <p className="text-lg text-center mb-10">
        Dedicated to fostering a community where sharing and sustainability are
        valued above all.
      </p>

      <div className="text-center mt-10">
        <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
        <p className="max-w-2xl mx-auto mb-6">
          Our mission is to create a platform that makes it easy for individuals
          to give away items they no longer need, and for others in the
          community to find these items for free. By doing so, we aim to reduce
          waste, support those in need, and promote a culture of generosity and
          sustainability.
        </p>
        <p className="max-w-2xl mx-auto">
          We believe in the power of community and the positive impact that
          sharing can have on individuals and the environment. Join us in making
          a difference, one item at a time.
        </p>
      </div>
    </div>
  );
}

export default AboutPage;
