import { ColumnLayer } from "@deck.gl/layers";

export default class FragColumnLayer extends ColumnLayer {
  // draw({ uniforms }) {
  //   super.draw({
  //     uniforms: {
  //       ...uniforms,
  //       cornerRadius: this.props.cornerRadius,
  //     },
  //   });
  // }

  getGeometry(
    diskResolution: number,
    vertices: number[] | undefined,
    hasThinkness: boolean
  ) {
    const geometry = new ColumnGeometry({
      radius: 1,
      height: hasThinkness ? 2 : 0,
      vertices,
      nradial: diskResolution,
    });

    let meanVertexDistance = 0;
    if (vertices) {
      for (let i = 0; i < diskResolution; i++) {
        const p = vertices[i];
        const d = Math.sqrt(p[0] * p[0] + p[1] * p[1]);
        meanVertexDistance += d / diskResolution;
      }
    } else {
      meanVertexDistance = 1;
    }
    this.setState({
      edgeDistance: Math.cos(Math.PI / diskResolution) * meanVertexDistance,
    });

    return geometry;
  }
}
