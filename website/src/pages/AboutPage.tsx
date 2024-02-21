import Footer  from '../components/Footer';
import Header from '../components/Header';
function AboutPage() {
  return (
    <div>
    <Header/>
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-center mb-4">About Us</h1>
      <p className="max-w-2xl mx-auto text-center mb-6">
        Hi! My name is <a href="https://dronavalli.dev" className="text-blue-500 hover:text-blue-700">Pranav Dronavalli</a> and my partner is <a href="https://dteather.com" className="text-blue-500 hover:text-blue-700">David Teather</a>. We are two software developers from Madison, Wisconsin where we currently attend college.
      </p>

      <div className="text-center mt-10">
        <h2 className="text-3xl font-bold mb-4">Motivation</h2>
        <p className="max-w-2xl mx-auto mb-6">
          We are both passionate about full-stack development and thought that the track proposed by RavenDB would not only be a fun challenge,
          but something that could possibly benefit the community and a platform that we envisioned could possibly even be used by people in the future.
        </p>
      </div>
    
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
    <Footer/>
    </div>
  );
}

export default AboutPage;
