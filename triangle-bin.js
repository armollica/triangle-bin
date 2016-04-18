d3.triangleBin = function() {
  var size = [400, 300],
      sideLength = 30,
      x = function(d) { return d[0]; },
      y = function(d) { return d[1]; };
  
  function triangleBin(data) {
    var points = data.map(function(d) { return [x(d), y(d)]; });
    
    var triangles = createTriangleGrid(size, sideLength)
      .map(function(d) { d.points = []; return d; });
    
    // TODO: Optimize binning. This brute force search is slow. 
    
    // Bin points in triangles
    points.forEach(function(point, i) {
      for (var i = 0; i < triangles.length; i++) {
        if (pointInTriangle(triangles[i], point)) triangles[i].points.push(point);
      }
    });
    
    return triangles
      .map(function(d) {
        var center = d.center,
            orientation = d.orientation;
        d = d.points;
        d.x = center[0];
        d.y = center[1];
        d.orientation = orientation;
        return d.length > 0 ? d : null;
      })
      .filter(function(d) { return d !== null; });
  }
  
  triangleBin.size = function(_) {
    if (!arguments.length) return size;
    size = _;
    return triangleBin;
  };
  
  triangleBin.sideLength = function(_) {
    if (!arguments.length) return sideLength;
    sideLength = _;
    return triangleBin;
  };
  
  triangleBin.x = function(_) {
    if (!arguments.length) return x;
    x = _;
    return triangleBin;
  };
  
  triangleBin.y = function(_) {
    if (!arguments.length) return y;
    y = _;
    return triangleBin;
  };
  
  triangleBin.triangle = function(orientation, length) {
    length = length || sideLength;
    var points = createTriangle([0, 0], length, orientation);
    return "M" + points.join("L") + "Z";
  };
  
  return triangleBin;
  
  // Creates an array of triangles that covers the area of the canvas
  function createTriangleGrid(size, sideLength) {
    
    var triangles = [],
        rc = sideLength / Math.sqrt(3), // maximum radius of circumscribing circle
        ri = rc / 2;                    // maximum radius of inscribing circle
        
   
    // upward pointing triangle
    for (var x = sideLength/2; x <= size[0] + sideLength; x += sideLength) {
      for (var y = rc - ri; y <= size[1] + sideLength; y += rc + ri) {
        var triangle = createTriangle([x, y], sideLength, "up");
        triangles.push(triangle);
      }
    }
    
    // downward pointing triangles
    for (var x = 0; x <= size[0] + sideLength; x += sideLength) {
      for (var y = 0; y <= size[1] + sideLength; y += rc + ri) {
        var triangle = createTriangle([x, y], sideLength, "down");
        triangles.push(triangle);
      }
    }
    
    return triangles;
  }
  
  // Create equilateral triangle (with counterclockwise vertices)
  function createTriangle(center, sideLength, orientation) {

    var cx = center[0],  
        cy = center[1],
        rc = sideLength / Math.sqrt(3), // maximum radius of circumscribing circle
        ri = rc / 2;                    // maximum radius of inscribing circle
        
    // Add vertices
    if (orientation === "up") {
      var triangle = [
        [cx, cy - rc],
        [cx - sideLength/2, cy + ri],
        [cx + sideLength/2, cy + ri]
      ];
    }
    else if (orientation === "down") {
      var triangle = [
        [cx, cy + rc],
        [cx + sideLength/2, cy - ri],
        [cx - sideLength/2, cy - ri]
      ];
    }
    
    triangle.center = center;
    triangle.orientation = orientation;
    
    return triangle;
  }
  
  // identify which side of a line and given point is
  function sideOfLine(line, point) {
    // TODO: clean up naming
    
    var x1 = line[0][0],
        y1 = line[0][1],
        x2 = line[1][0],
        y2 = line[1][1],
        x = point[0],
        y = point[1];
        
    return (y2 - y1) * (x - x1) + (-x2 + x1) * (y - y1);
  }
    
  // identify if a point is in a triangle
  function pointInTriangle(triangle, point) {
    // triangle points must be counterclockwise 
    
    // TODO: clean up naming
    var x1 = triangle[0][0],
        y1 = triangle[0][1],
        x2 = triangle[1][0],
        y2 = triangle[1][1],
        x3 = triangle[2][0],
        y3 = triangle[2][1],
        x = point[0],
        y = point[1];
        
    var checkSide1 = sideOfLine([[x1, y1], [x2, y2]], [x, y]) >= 0,
        checkSide2 = sideOfLine([[x2, y2], [x3, y3]], [x, y]) >= 0,
        checkSide3 = sideOfLine([[x3, y3], [x1, y1]], [x, y]) >= 0;
    return checkSide1 && checkSide2 && checkSide3;
  }
}